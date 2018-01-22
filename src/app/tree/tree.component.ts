import {
	Component, Input, ElementRef, Output, EventEmitter
} from '@angular/core';

import { NodesListService } from './services/nodesList.service';
import { DomSanitizer } from '@angular/platform-browser';
import {NodeData} from './classes/NodeData';
import {TreeDiagramNode} from './classes/node.class';
import {TreeDiagramNodesList} from './classes/nodesList.class';


export interface TreeSizeConfig {
  nodeWidth: number;
  nodeHeight: number;
	allowScroll?: boolean;
	allowDrag?: boolean;
	showNewNode?: boolean;
}
export interface TreeConfig {
  json: NodeData[];
  config: TreeSizeConfig;

};
@Component({
	selector: 'tree-diagram',
	styleUrls: ['./tree.component.scss'],
	templateUrl: './tree.component.html',
    providers: [NodesListService],
    host: {
	  '[style.height.px]': 'nodes?.treeHeight'
    }
})
export class Tree {

	public static ELEMENT_MARGIN = 15;
    public config: TreeSizeConfig = {
        nodeWidth: 200,
        nodeHeight: 100,
		allowScroll: true,
        allowDrag: true,
        showNewNode: true
    };

  private paneDragging = false
  private paneTransform
  private zoom = 1
  private paneX = 0
  private paneY = 0
  public nodes: TreeDiagramNodesList;

  @Output() public nodeClicked = new EventEmitter<TreeDiagramNode>();

  @Input() set data(_data){

    if (!_data || !Array.isArray(_data.json)) return
    if (typeof _data.config === 'object') {
      this.config = Object.assign(this.config, _data.config)
    }
    this.nodes = this.nodesSrv.loadNodes(_data.json, this.config);
  }

  constructor (
    private nodesSrv: NodesListService,
    private sanitizer: DomSanitizer
  ) {

  }

  public newNode(){
    this.nodesSrv.newNode()
  }

  public get nodeMaker(){
    return this.nodesSrv.makerNode()
  }

  public onmousedown (event) {
    if (!this.config.allowDrag) {
      return;
    }
    this.paneDragging = true;
  }

  public onmousemove (event) {
    if (this.paneDragging) {
      let { movementX, movementY } = event
      this.paneX += movementX
      this.paneY += movementY
      this.makeTransform()
    }
  }

  public onmouseup () {
    this.paneDragging = false
  }

  public makeTransform(){
    this.paneTransform = this.sanitizer.bypassSecurityTrustStyle(`translate(${this.paneX }px, ${this.paneY}px) scale(${this.zoom})`)
  }

  public preventMouse(event){
    event.stopPropagation()
  }

  public onmousewheel(event){
    if (!this.config.allowScroll) {
      return;
    }
    let delta;
    event.preventDefault();
    delta = event.detail || event.wheelDelta;
    this.zoom += delta / 1000 / 2;
    this.zoom = Math.min(Math.max(this.zoom, 0.2), 3);
    this.makeTransform()
  }

  public nodeClick(data: TreeDiagramNode) {
      this.nodeClicked.next(data);
  }

	public getValues() {
		return this.nodesSrv.getNodes();
	}

	public getValuesSerialized() {
		return this.nodesSrv.getNodesSerialized();
	}

}