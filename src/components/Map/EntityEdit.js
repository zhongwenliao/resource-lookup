export default class EntityEdit {
  constructor(viewer) {
    // 将传入的 viewer 对象赋值给实例的 viewer 属性，以便在类的其他方法中使用
    if (!(viewer instanceof LSGlobe.Viewer)) {
      throw new Error('The "viewer" parameter must be an instance of LSGlobe.Viewer.');
    }
    this.viewer = viewer;
    // 初始化 DrawExample 属性为空字符串，用于存储绘制示例相关信息
    this.DrawExample = "";
    // 初始化 midVertexEntities 属性为空数组，用于存储中点节点实体
    this.midVertexEntities = [];
    // 调用 initEventHandler 方法，初始化事件处理程序
    this.initEventHandler();
  }

  //鼠标事件
  initEventHandler() {
    if (!this.viewer || !this.viewer.scene.canvas) {
      throw new Error("Viewer or canvas is not available.");
    }
    // 创建屏幕空间事件处理程序，用于监听场景画布上的鼠标事件
    this.eventHandler = new LSGlobe.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    // 创建编辑结束事件，用于在编辑操作结束时触发回调函数
    this.EditEndEvent = new LSGlobe.Event();
    // 创建编辑结束实体事件，用于在编辑某个实体结束时触发特定处理逻辑
    this.EditEndEntity = new LSGlobe.Event();
  }

  //激活编辑
  activate() {
    try {
      // 禁用当前可能存在的编辑状态，确保编辑状态被重置
      this.deactivate();
      // 初始化鼠标左键点击事件处理程序，以便用户可以通过点击场景中的对象来选择需要编辑的实体
      this.initLeftClickEventHandler();
    } catch (error) {
      console.error("Failed to activate edit mode:", error);
    }
  }

  //禁用编辑
  deactivate() {
    try {
      // 重置 DrawExample 属性
      this.DrawExample = "";
      // 移除鼠标左键点击事件监听
      if (this.eventHandler) {
        this.eventHandler.removeInputAction(LSGlobe.ScreenSpaceEventType.LEFT_CLICK);
      }
      // 取消所有事件监听
      this.unRegisterEvents();
      // 清空编辑节点
      this.clearAllEditVertex();
    } catch (error) {
      console.error("Failed to deactivate edit mode:", error);
    }
  }

  //清空编辑节点
  clearAllEditVertex() {
    try {
      // 清空顶点节点，移除所有顶点节点实体并重置顶点节点数组
      this.clearEditVertex();
      // 清空中点节点，移除所有中点节点实体并重置中点节点数组
      this.clearMidVertex();
    } catch (error) {
      console.error("Failed to clear all edit vertices:", error);
    }
  }

  //左键点击事件
  initLeftClickEventHandler() {
    // 为鼠标左键点击事件设置输入动作处理函数
    this.eventHandler.setInputAction((e) => {
      // 打印日志，表明左键点击事件被触发
      console.log("左键点击事件");
      // 使用 viewer.scene.pick 方法拾取鼠标点击位置的对象
      let id = this.viewer.scene.pick(e.position);
      // 检查是否拾取到对象，如果没有拾取到对象或者拾取结果不包含 id 属性
      if (!id || !id.id) {
        // 调用 handleEditEntity 方法处理当前编辑对象
        this.handleEditEntity();
        // 直接返回，不做任何操作
        return;
      }
      // 检查拾取结果的 id 是否存在，以及该 id 是否包含 Type 属性
      if (!id.id || !id.id.Type) return;
      // 检查当前是否有正在编辑的对象，并且该对象的 id 与拾取到的对象的 id 相同
      if (this.editEntity && this.editEntity.id == id.id.id) return;
      // 检查当前是否有正在编辑的对象
      if (this.editEntity) return;
      // 处理上一个编辑对象
      this.handleEditEntity();
      // 处理拾取到的新对象
      this.handlePickEditEntity(id.id);
    }, LSGlobe.ScreenSpaceEventType.LEFT_CLICK);
  }

  //处理编辑对象
  handleEditEntity() {
    // 取消所有事件监听，避免在结束编辑后仍有不必要的事件触发
    this.unRegisterEvents();
    // 清空所有编辑节点，包括顶点和中点节点
    this.clearAllEditVertex();
    // 获取当前正在编辑的实体对象
    let editEntity = this.editEntity;
    // 如果没有正在编辑的实体对象，直接返回，不进行后续操作
    if (!editEntity) return;
    // 关闭实体编辑模式，更新实体的位置和属性
    this.closeEntityEditMode();
    // 将当前编辑的实体对象置为 undefined，表示编辑结束
    this.editEntity = undefined;
    // 如果在编辑过程中没有对实体进行任何修改，直接返回，不触发编辑结束事件
    if (!this.isEdited) return;
    // 触发编辑结束事件，传递被编辑的实体对象作为参数
    this.EditEndEvent.raiseEvent(editEntity);
    // 将编辑状态标志置为 false，表示编辑结束
    this.isEdited = false;
    this.isEditing = false;
  }

  //处理拾取到的对象
  handlePickEditEntity(pickId) {
    // 定义一个数组，包含所有可编辑的实体类型
    const EditableTypes = [
      "DrawAttackArrow",
      "DrawCircle",
      "DrawCurve",
      "DrawPincerArrow",
      "DrawPoint",
      "DrawPolygon",
      "DrawPolyline",
      "DrawRectangle",
      "DrawstraightArrow",
      "GatheringPlace",
      "DrawSector",
      "DrawClosedCurve"
    ];
    // 检查拾取到的实体类型是否在可编辑类型数组中
    // 如果不在，则直接返回，不进行后续操作
    if (!EditableTypes.includes(pickId.Type)) return;
    try {
      // 调用 setEditEntity 方法，设置当前编辑实体，并触发编辑结束实体事件
      this.setEditEntity(pickId);
      // 调用 resetEditState 方法，重置编辑状态标志
      this.resetEditState();
      // 调用 initEditPositions 方法，获取当前编辑实体的位置信息和中心点位置
      this.initEditPositions();
      // 调用 openEditMode 方法，打开实体编辑模式
      this.openEditMode();
      // 调用 resetEditNodesAndEvents 方法，清空所有编辑节点并取消所有已注册的事件监听
      this.resetEditNodesAndEvents();
      // 调用 createEditNodes 方法，创建编辑节点和中点节点
      this.createEditNodes();
      // 调用 registerEditEvents 方法，注册事件监听
      this.registerEditEvents();
    } catch (error) {
      console.error("Failed to handle picked entity:", error);
    }
  }

  /**
   * 设置当前要编辑的实体，并触发编辑结束实体事件。
   * @param {Object} pickId - 用户在场景中拾取到的实体对象。
   */
  setEditEntity(pickId) {
    if (!pickId) {
      throw new Error('The "pickId" parameter must be a valid entity object.');
    }
    this.editEntity = pickId;
    this.EditEndEntity.raiseEvent(this.editEntity);
  }

  /**
   * 重置编辑状态，将 isEditing 和 isEdited 标志设置为 false。
   * isEditing 表示当前是否正在进行编辑操作。
   * isEdited 表示实体是否已经被编辑过。
   */
  resetEditState() {
    // 标记当前没有正在进行的编辑操作
    this.isEditing = false;
    // 标记实体尚未被编辑
    this.isEdited = false;
  }

  /**
   * 初始化编辑实体的位置信息和中心点位置。
   * 该方法会调用 getEditEntityPositions 方法获取编辑实体的位置信息，
   * 并调用 getCenterPosition 方法计算编辑实体的中心点位置。
   */
  initEditPositions() {
    try {
      const positions = this.getEditEntityPositions();
      if (!positions || positions.length === 0) {
        throw new Error("Failed to get valid edit entity positions.");
      }
      this.editPositions = positions;
      const centerPosition = this.getCenterPosition();
      if (!centerPosition) {
        throw new Error("Failed to get valid center position.");
      }
      this.EditMoveCenterPositoin = centerPosition;
    } catch (error) {
      console.error("Failed to initialize edit positions:", error);
    }
  }
  /**
   * 开启实体的编辑模式。
   * 该方法会调用 openEntityEditModel 方法，根据当前编辑实体的类型，动态更新实体的属性。
   */
  openEditMode() {
    try {
      this.openEntityEditModel();
    } catch (error) {
      console.error("Failed to open edit mode:", error);
    }
  }

  /**
   * 重置编辑节点和取消已注册的事件监听。
   * 该方法会调用 clearAllEditVertex 方法清空所有编辑节点，
   * 并调用 unRegisterEvents 方法取消所有已注册的事件监听。
   */
  resetEditNodesAndEvents() {
    try {
      this.clearAllEditVertex();
      this.unRegisterEvents();
    } catch (error) {
      console.error("Failed to reset edit nodes and events:", error);
    }
  }

  /**
   * 创建编辑节点和中点节点。
   * 该方法会调用 createEditVertex 方法创建编辑顶点节点，
   * 并调用 createMidVertex 方法创建中点节点。
   */
  createEditNodes() {
    try {
      this.createEditVertex();
      this.createMidVertex();
    } catch (error) {
      console.error("Failed to create edit nodes:", error);
    }
  }
  /**
   * 注册与编辑操作相关的事件监听。
   * 该方法会调用 registerEvents 方法，注册鼠标左键按下、鼠标移动和鼠标左键抬起事件。
   */
  registerEditEvents() {
    try {
      this.registerEvents();
    } catch (error) {
      console.error("Failed to register edit events:", error);
    }
  }

  openEntityEditModel() {
    if (this.DrawExample == "") return;
    switch (this.editEntity.Type) {
      case "DrawAttackArrow":
        this.editEntity.polygon.hierarchy = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions);
        }, false);
        break;
      case "DrawCircle":
        this.editEntity.position = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions).position;
        }, false);
        this.editEntity.ellipse.semiMinorAxis = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions).r;
        }, false);
        this.editEntity.ellipse.semiMajorAxis = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions).r;
        }, false);
        break;
      case "DrawCurve":
        this.editEntity.polyline.positions = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions);
        }, false);
        break;
      case "DrawPincerArrow":
        this.editEntity.polygon.hierarchy = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions);
        }, false);
        break;
      case "DrawPoint":
        this.editEntity.position = new LSGlobe.CallbackProperty((e) => {
          return this.editPositions[0];
        }, false);
        break;
      case "DrawPolygon":
        this.editEntity.polygon.hierarchy = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions);
        }, false);
        break;
      case "DrawPolyline":
        this.editEntity.polyline.positions = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions);
        }, false);
        break;
      case "DrawRectangle":
        this.editEntity.rectangle.coordinates = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions);
        }, false);
        break;
      case "DrawstraightArrow":
        this.editEntity.polygon.hierarchy = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions);
        }, false);
        break;
      case "GatheringPlace":
        this.editEntity.polygon.hierarchy = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions);
        }, false);
        break;
      case "DrawSector":
        this.editEntity.polygon.hierarchy = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions);
        }, false);
        break;
      case "DrawClosedCurve":
        this.editEntity.polygon.hierarchy = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions).PolygonHierarchy;
        }, false);
        this.editEntity.polyline.positions = new LSGlobe.CallbackProperty((e) => {
          return this.DrawExample.computePosition(this.editPositions).pList;
        }, false);
        break;
    }
  }

  closeEntityEditMode() {
    if (this.DrawExample == "") return;
    let position = "";
    switch (this.editEntity.Type) {
      case "DrawAttackArrow":
        position = this.DrawExample.computePosition(this.editPositions);
        this.editEntity.polygon.hierarchy = position;
        this.editEntity.Position = this.DrawExample.getData();
        break;
      case "DrawCircle":
        position = this.DrawExample.computePosition(this.editPositions);
        this.editEntity.position = position.position;
        this.editEntity.ellipse.semiMinorAxis = position.r;
        this.editEntity.ellipse.semiMajorAxis = position.r;
        this.editEntity.Position = this.DrawExample.getData();
        break;
      case "DrawCurve":
        position = this.DrawExample.computePosition(this.editPositions);
        this.editEntity.polyline.positions = position;
        this.editEntity.Position = this.DrawExample.getData();
        break;
      case "DrawPincerArrow":
        position = this.DrawExample.computePosition(this.editPositions);
        this.editEntity.polygon.hierarchy = position;
        this.editEntity.Position = this.DrawExample.getData();
        break;
      case "DrawPoint":
        position = this.DrawExample.computePosition(this.editPositions);
        this.editEntity.position = position;
        this.editEntity.Position = this.DrawExample.getData();
        break;
      case "DrawPolygon":
        position = this.DrawExample.computePosition(this.editPositions);
        this.editEntity.polygon.hierarchy = position;
        this.editEntity.Position = this.DrawExample.getData();
        break;
      case "DrawPolyline":
        position = this.DrawExample.computePosition(this.editPositions);
        this.editEntity.polyline.positions = position;
        this.editEntity.Position = this.DrawExample.getData();
        break;
      case "DrawRectangle":
        position = this.DrawExample.computePosition(this.editPositions);
        this.editEntity.rectangle.coordinates = position;
        this.editEntity.Position = this.DrawExample.getData();
        break;
      case "DrawstraightArrow":
        position = this.DrawExample.computePosition(this.editPositions);
        this.editEntity.polygon.hierarchy = position;
        this.editEntity.Position = this.DrawExample.getData();
        break;
      case "GatheringPlace":
        position = this.DrawExample.computePosition(this.editPositions);
        this.editEntity.polygon.hierarchy = position;
        this.editEntity.Position = this.DrawExample.getData();
        break;
      case "DrawSector":
        position = this.DrawExample.computePosition(this.editPositions);
        this.editEntity.polygon.hierarchy = position;
        this.editEntity.Position = this.DrawExample.getData();
        break;
      case "DrawClosedCurve":
        position = this.DrawExample.computePosition(this.editPositions);
        this.editEntity.polygon.hierarchy = position.PolygonHierarchy;
        this.editEntity.polyline.positions = position.pList;
        this.editEntity.Position = this.DrawExample.getData();
        break;
    }
  }

  getEditEntityPositions() {
    let position = this.editEntity.Position;
    let positionArr = [];
    switch (this.editEntity.Type) {
      case "DrawAttackArrow":
        for (let i = 0; i < position.length; i++) {
          positionArr.push(this.LatlngTocartesian(position[i]));
        }
        return positionArr;
      case "DrawCircle":
        for (let i = 0; i < position.length; i++) {
          positionArr.push(this.LatlngTocartesian(position[i]));
        }
        return positionArr;
      case "DrawCurve":
        for (let i = 0; i < position.length; i++) {
          positionArr.push(this.LatlngTocartesian(position[i]));
        }
        return positionArr;
      case "DrawPincerArrow":
        for (let i = 0; i < position.length; i++) {
          positionArr.push(this.LatlngTocartesian(position[i]));
        }
        return positionArr;
      case "DrawPoint":
        for (let i = 0; i < position.length; i++) {
          positionArr.push(this.LatlngTocartesian(position[i]));
        }
        return positionArr;
      case "DrawPolygon":
        for (let i = 0; i < position.length; i++) {
          positionArr.push(this.LatlngTocartesian(position[i]));
        }
        return positionArr;
      case "DrawPolyline":
        for (let i = 0; i < position.length; i++) {
          positionArr.push(this.LatlngTocartesian(position[i]));
        }
        return positionArr;
      case "DrawRectangle":
        for (let i = 0; i < position.length; i++) {
          positionArr.push(this.LatlngTocartesian(position[i]));
        }
        return positionArr;
      case "DrawstraightArrow":
        for (let i = 0; i < position.length; i++) {
          positionArr.push(this.LatlngTocartesian(position[i]));
        }
        return positionArr;
      case "GatheringPlace":
        for (let i = 0; i < position.length; i++) {
          positionArr.push(this.LatlngTocartesian(position[i]));
        }
        return positionArr;
      case "DrawSector":
        for (let i = 0; i < position.length; i++) {
          positionArr.push(this.LatlngTocartesian(position[i]));
        }
        return positionArr;
      case "DrawClosedCurve":
        for (let i = 0; i < position.length; i++) {
          positionArr.push(this.LatlngTocartesian(position[i]));
        }
        return positionArr;
    }
  }

  /**
   * 注册与编辑操作相关的鼠标事件。
   * 该方法会调用 initLeftDownEventHandler 方法初始化鼠标左键按下事件处理程序，
   * 调用 initMouseMoveEventHandler 方法初始化鼠标移动事件处理程序，
   * 调用 initLeftUpEventHandler 方法初始化鼠标左键抬起事件处理程序。
   */
  registerEvents() {
    try {
      this.initLeftDownEventHandler();
      this.initMouseMoveEventHandler();
      this.initLeftUpEventHandler();
    } catch (error) {
      console.error("Failed to register events:", error);
    }
  }

  /**
   * 取消注册与编辑操作相关的鼠标事件。
   * 该方法会移除鼠标左键按下、鼠标左键抬起和鼠标移动事件的输入动作处理函数。
   */
  unRegisterEvents() {
    try {
      this.eventHandler.removeInputAction(LSGlobe.ScreenSpaceEventType.LEFT_DOWN);
      this.eventHandler.removeInputAction(LSGlobe.ScreenSpaceEventType.LEFT_UP);
      this.eventHandler.removeInputAction(LSGlobe.ScreenSpaceEventType.MOUSE_MOVE);
    } catch (error) {
      console.error("Failed to unregister events:", error);
    }
  }

  /**
   * 初始化鼠标左键按下事件的处理程序。
   * 该方法为鼠标左键按下事件设置一个输入动作处理函数，用于处理用户在场景中按下鼠标左键时的交互。
   * 根据拾取到的对象类型，调用不同的处理方法。
   */
  initLeftDownEventHandler() {
    // 为鼠标左键按下事件设置输入动作处理函数
    this.eventHandler.setInputAction((e) => {
      // 使用 viewer.scene.pick 方法拾取鼠标点击位置的对象
      let id = this.viewer.scene.pick(e.position);
      // 检查是否拾取到对象，以及拾取结果是否包含 id 和 type 属性
      if (!id || !id.id || !id.id.type) return;

      // 如果拾取到的对象类型为 EditVertex 或 EditMove
      if (id.id.type === "EditVertex" || id.id.type === "EditMove") {
        // 调用 startEditing 方法开始编辑操作
        this.startEditing(id.id);
        // 如果拾取到的对象类型为 EditMidVertex
      } else if (id.id.type === "EditMidVertex") {
        // 调用 insertVertex 方法在当前位置插入一个新的顶点
        this.insertVertex(id.id);
      }
      // 监听鼠标左键按下事件
    }, LSGlobe.ScreenSpaceEventType.LEFT_DOWN);
  }

  startEditing(editVertex) {
    // 标记当前正在进行编辑操作
    this.isEditing = true;
    // 禁用场景相机的旋转功能，防止在编辑过程中相机旋转干扰操作
    this.viewer.scene.screenSpaceCameraController.enableRotate = false;
    // 禁用 viewer 的光标样式控制
    this.viewer.enableCursorStyle = false;
    // 清除 viewer 元素的光标样式
    this.viewer._element.style.cursor = "";
    // 将鼠标指针样式设置为 "move"，提示用户可以进行移动操作
    document.body.style.cursor = "move";
    // 记录当前编辑的顶点对象
    this.editVertext = editVertex;
    // 隐藏当前编辑的顶点，避免在编辑过程中造成视觉干扰
    this.editVertext.show = false;
    try {
      // 清空中点节点
      this.clearMidVertex();
    } catch (error) {
      console.error("Failed to clear mid vertices:", error);
    }
  }

  /**
   * 在编辑的实体中插入一个新的顶点。
   *
   * @param {Object} midVertex - 中点顶点对象，包含插入位置的相关信息。
   * @param {number} midVertex.vertexIndex - 新顶点要插入的位置索引。
   * @param {Object} midVertex.position - 新顶点的位置信息。
   * @param {any} midVertex.position._value - 新顶点的具体位置值。
   */
  insertVertex(midVertex) {
    // 验证 midVertex 对象是否包含必要的属性
    if (!midVertex || !midVertex.vertexIndex || !midVertex.position || !midVertex.position._value) {
      console.error("Invalid midVertex object:", midVertex);
      return;
    }
    try {
      // 在 editPositions 数组中插入新的顶点，从 vertexIndex 位置开始，删除 0 个元素，并插入新顶点
      this.editPositions.splice(midVertex.vertexIndex, 0, midVertex.position._value);
      // 清空所有编辑节点，包括顶点和中点节点，为重新创建节点做准备
      this.clearAllEditVertex();
      // 创建新的编辑顶点节点，根据更新后的 editPositions 数组生成新的顶点节点
      this.createEditVertex();
      // 创建新的中点节点，根据更新后的顶点节点生成新的中点节点
      this.createMidVertex();
      // 标记实体已经被编辑过，将 isEdited 标志设置为 true
      this.isEdited = true;
    } catch (error) {
      // 捕获并打印插入顶点时可能出现的错误
      console.error("Failed to insert vertex:", error);
    }
  }

  /**
   * 初始化鼠标左键抬起事件的处理程序。
   * 该方法为鼠标左键抬起事件设置一个输入动作处理函数，用于处理用户在场景中抬起鼠标左键时的交互。
   * 当鼠标左键抬起时，如果当前处于编辑状态，会执行一系列操作来结束编辑状态并更新场景。
   */
  initLeftUpEventHandler() {
    // 为鼠标左键抬起事件设置输入动作处理函数
    this.eventHandler.setInputAction((e) => {
      // 检查当前是否处于编辑状态，如果不是则直接返回，不执行后续操作
      if (!this.isEditing) return;
      try {
        // 启用 viewer 的光标样式控制
        this.viewer.enableCursorStyle = true;
        // 将鼠标指针样式恢复为默认样式
        document.body.style.cursor = "default";
        // 启用场景相机的旋转功能，允许用户在编辑结束后继续旋转相机
        this.viewer.scene.screenSpaceCameraController.enableRotate = true;
        // 显示当前编辑的顶点，使其在编辑结束后可见
        this.editVertext.show = true;
        // 将 isEditing 标志设置为 false，表示编辑操作结束
        this.isEditing = false;
        // 清空中点节点，移除所有中点节点实体
        this.clearMidVertex();
        // 创建新的中点节点，更新中点节点的显示
        this.createMidVertex();
      } catch (error) {
        // 捕获并打印鼠标左键抬起事件处理时可能出现的错误
        console.error("Failed to handle left up event:", error);
      }
      // 监听鼠标左键抬起事件
    }, LSGlobe.ScreenSpaceEventType.LEFT_UP);
  }

  /**
   * 初始化鼠标移动事件的处理程序。
   * 该方法为鼠标移动事件设置一个输入动作处理函数，用于处理用户在场景中移动鼠标时的交互。
   * 当鼠标移动时，如果当前处于编辑状态，会根据编辑的顶点类型执行相应的操作。
   */
  initMouseMoveEventHandler() {
    // 为鼠标移动事件设置输入动作处理函数
    this.eventHandler.setInputAction((e) => {
      // 获取鼠标移动的结束位置
      var position = e.endPosition;
      // 从相机位置创建一条指向鼠标位置的射线
      var ray = this.viewer.scene.camera.getPickRay(position);
      // 计算射线与地球表面的交点，得到笛卡尔坐标
      var cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      // 如果没有找到交点，直接返回，不执行后续操作
      if (!cartesian) return;

      // 检查当前是否处于编辑状态，如果不是则直接返回，不执行后续操作
      if (!this.isEditing) return;
      // 如果当前编辑的顶点类型为 EditMove，表示要整体移动实体
      if (this.editVertext.type == "EditMove") {
        // 获取实体的起始中心点位置
        let startPosition = this.EditMoveCenterPositoin;
        // 如果起始中心点位置不存在，直接返回，不执行后续操作
        if (!startPosition) return;
        // 根据偏移量移动实体
        this.moveEntityByOffset(startPosition, cartesian);
        // 如果当前编辑的顶点类型为 EditVertex 或 EditMidVertex，表示要移动单个顶点
      } else if (this.editVertext.type == "EditVertex" || this.editVertext.type == "EditMidVertex") {
        // 更新编辑位置数组中对应顶点的位置
        this.editPositions[this.editVertext.vertexIndex] = cartesian;
      }
      // 标记实体已经被编辑过，将 isEdited 标志设置为 true
      this.isEdited = true;
      // 重新计算编辑实体的中心点位置
      this.EditMoveCenterPositoin = this.getCenterPosition();
      // 监听鼠标移动事件
    }, LSGlobe.ScreenSpaceEventType.MOUSE_MOVE);
  }

  //获取编辑对象中心点
  getCenterPosition() {
    let points = [];
    let maxHeight = 0;
    //如果是点 返回第一个点作为移动点
    if (this.editEntity.Type == "DrawCircle" || this.editEntity.Type == "DrawPoint" || this.editEntity.Type == "DrawSector") {
      return this.editPositions[0];
    }

    //获取所有节点的最高位置
    this.editPositions.forEach((position) => {
      const point3d = this.cartesian3ToPoint3D(position);
      points.push([point3d.x, point3d.y]);
      if (maxHeight < point3d.z) maxHeight = point3d.z;
    });

    //构建turf.js  lineString
    let geo = turf.lineString(points);
    let bbox = turf.bbox(geo);
    let bboxPolygon = turf.bboxPolygon(bbox);
    let pointOnFeature = turf.center(bboxPolygon);
    let lonLat = pointOnFeature.geometry.coordinates;
    return LSGlobe.Cartesian3.fromDegrees(lonLat[0], lonLat[1], maxHeight);
  }

  //根据偏移量移动实体
  moveEntityByOffset(startPosition, endPosition) {
    let startPoint3d = this.cartesian3ToPoint3D(startPosition);
    let endPoint3d = this.cartesian3ToPoint3D(endPosition);
    let offsetX = endPoint3d.x - startPoint3d.x;
    let offsetY = endPoint3d.y - startPoint3d.y;
    //设置偏移量
    let element;
    for (let i = 0; i < this.editPositions.length; i++) {
      element = this.cartesian3ToPoint3D(this.editPositions[i]);
      element.x += offsetX;
      element.y += offsetY;
      this.editPositions[i] = LSGlobe.Cartesian3.fromDegrees(element.x, element.y, element.z);
    }
  }

  //创建编辑节点
  createEditVertex() {
    this.vertexEntities = [];
    this.editPositions.forEach((p, index) => {
      const entity = this.viewer.entities.add({
        position: new LSGlobe.CallbackProperty((e) => {
          return this.editPositions[index];
        }, false),
        type: "EditVertex",
        vertexIndex: index, //节点索引
        point: {
          color: LSGlobe.Color.DARKBLUE.withAlpha(0.9),
          pixelSize: 10,
          outlineColor: LSGlobe.Color.YELLOW.withAlpha(0.9),
          outlineWidth: 5,
          disableDepthTestDistance: 2000,
          heightReference: LSGlobe.HeightReference.CLAMP_TO_GROUND
        }
      });
      this.vertexEntities.push(entity);
    });
    // 如果是圆则隐藏中心点
    if (this.editEntity.Type == "DrawCircle") {
      this.vertexEntities[0].show = false;
    }
    if (this.editPositions.length == 1) {
      // 只有一个节点表示点类型 不需要创建整体移动节点
      return;
    }
    this.createEditMoveCenterEntity();
  }

  // 整体移动
  createEditMoveCenterEntity() {
    this.EditMoveCenterEntity = this.viewer.entities.add({
      position: new LSGlobe.CallbackProperty((e) => {
        return this.EditMoveCenterPositoin;
      }, false),
      type: "EditMove",
      point: {
        color: LSGlobe.Color.RED.withAlpha(0.9),
        pixelSize: 10,
        outlineColor: LSGlobe.Color.WHITE.withAlpha(0.9),
        outlineWidth: 3,
        disableDepthTestDistance: 2000
      }
    });
  }

  // 清空编辑节点
  clearEditVertex() {
    if (this.vertexEntities) {
      this.vertexEntities.forEach((item) => {
        this.viewer.entities.remove(item);
      });
    }
    this.vertexEntities = [];
    this.viewer.entities.remove(this.EditMoveCenterEntity);
  }

  // 创建中点节点
  createMidVertex() {
    if (
      this.editEntity.Type == "DrawCircle" ||
      this.editEntity.Type == "DrawPincerArrow" ||
      this.editEntity.Type == "DrawRectangle" ||
      this.editEntity.Type == "DrawstraightArrow" ||
      this.editEntity.Type == "GatheringPlace" ||
      this.editEntity.Type == "DrawSector"
    ) {
      return;
    }
    this.midVertexEntities = [];
    for (let i = 0; i < this.editPositions.length; i++) {
      const p1 = this.editPositions[i];
      const p2 = this.editPositions[i + 1];
      let mideP = this.midPosition(p1, p2);
      const entity = this.viewer.entities.add({
        position: mideP,
        type: "EditMidVertex",
        vertexIndex: i + 1, // 节点索引
        point: {
          color: LSGlobe.Color.LIMEGREEN.withAlpha(0.9),
          pixelSize: 10,
          outlineColor: LSGlobe.Color.YELLOW.withAlpha(0.9),
          outlineWidth: 3,
          disableDepthTestDistance: 2000
        }
      });
      this.midVertexEntities.push(entity);
    }
  }

  clearMidVertex() {
    // 检查 midVertexEntities 数组是否存在
    if (this.midVertexEntities) {
      try {
        // 遍历 midVertexEntities 数组中的每个实体
        this.midVertexEntities.forEach((item) => {
          // 从 viewer 的实体集合中移除当前实体
          this.viewer.entities.remove(item);
        });
      } catch (error) {
        console.error("Failed to remove mid vertex entities:", error);
      }
    }
    // 将 midVertexEntities 数组重置为空数组
    this.midVertexEntities = [];
  }

  // 笛卡尔坐标转为经纬度xyz
  cartesian3ToPoint3D(position) {
    const cartographic = LSGlobe.Cartographic.fromCartesian(position);
    const lon = LSGlobe.Math.toDegrees(cartographic.longitude);
    const lat = LSGlobe.Math.toDegrees(cartographic.latitude);
    return { x: lon, y: lat, z: cartographic.height };
  }

  // 获取两个节点的中心点
  midPosition(first, second) {
    if (!first || !second) return null;
    let point3d1 = this.cartesian3ToPoint3D(first);
    let point3d2 = this.cartesian3ToPoint3D(second);
    let midLonLat = {
      x: (point3d1.x + point3d2.x) / 2,
      y: (point3d1.y + point3d2.y) / 2,
      z: (point3d1.z + point3d2.z) / 2
    };
    return LSGlobe.Cartesian3.fromDegrees(midLonLat.x, midLonLat.y, midLonLat.z);
  }

  cartesianToLatlng(cartesian) {
    let cartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    let lat = new LSGlobe.Math.toDegrees(cartographic.latitude);
    let lng = new LSGlobe.Math.toDegrees(cartographic.longitude);
    let alt = cartographic.height;
    return [lng, lat];
  }

  LatlngTocartesian(latlng) {
    let cartesian3 = new LSGlobe.Cartesian3.fromDegrees(latlng[0], latlng[1]);
    return cartesian3;
  }
}
