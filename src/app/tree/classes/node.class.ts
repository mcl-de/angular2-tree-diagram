import { TreeDiagramNodesList } from './nodesList.class';
export interface NodeDroppedEvent {
  origin: string;
  target: string;
}
export class TreeDiagramNode {
  public parentId: string | null;
  public guid: string;
  public width: number;
  public height: number;
  public isDragover: boolean;
  public isDragging: boolean;
  private _toggle: boolean;
  public children: Set<string>;
  public displayName: string;
  public readonly: boolean;
  public childTranslation: number = 0;
  public translationX: number = 0;
  public totalWidth;
  constructor (props, config, public getThisNodeList: () => TreeDiagramNodesList) {
    if (!props.guid) {
      return;
    }
    for (let prop in props) {
      if (props.hasOwnProperty(prop)) {
        this[prop] = props[prop];
      }
    }

    this._toggle = true;

    if (config.nodeWidth) {
      this.width = config.nodeWidth
    }
    if (config.nodeHeight) {
      this.height = config.nodeHeight
    }
    this.children = new Set(<string[]>props.children)
  }

  public destroy () {
    throw new Error('Destroying is not supported')
    // this.getThisNodeList().destroy(this.guid)
  }

  public get isExpanded () {
    return this._toggle
  }

  public hasChildren () {
    return !!this.children.size
  }

  public toggle (state = !this._toggle) {
    throw new Error('toggling is not supported')
    // this._toggle = state;
    // if (state) { // If we are setting this to toggled true then we need to inform all its siblings
		// this.getThisNodeList().toggleSiblings(this.guid);
    // }
  }

  public childrenCount () {
    return this.children.size
  }

  public isRoot () {
    return this.parentId == null;
  }

  public dragenter (event) {
    event.dataTransfer.dropEffect = 'move';
  }

  public dragleave (event) {
    this.isDragover = false;
  }

  public dragstart (event) {
    event.dataTransfer.effectAllowed = 'move';
    this.isDragging = true;
    // this.toggle(false)
    this.getThisNodeList().draggingNodeGuid = this.guid
  }

  public dragover (event) {
    event.preventDefault();
    if (!this.isDragging) {
      this.isDragover = true;
    }
    event.dataTransfer.dropEffect = 'move'
    return false;
  }

  public dragend(event){
    this.isDragover = false;
    this.isDragging = false;
  }

  public drop (event): NodeDroppedEvent {
    event.preventDefault();
    let guid = this.getThisNodeList().draggingNodeGuid
    // this.getThisNodeList().transfer(guid, this.guid); this is disabled because changing the diagramm without reload is NOT supported
    return {
      origin: guid,
        target: this.guid
    };
  }

  public addChild(){
    throw new Error('Adding childs is not supported');
    // let newNodeGuid = this.getThisNodeList().newNode(this.guid)
    // this.children.add(newNodeGuid)
    // this.toggle(true)
  }
}