import {
	Component, EventEmitter, Input, Output
} from '@angular/core';

import { NodesListService } from '../services/nodesList.service'
import {NodeDroppedEvent, TreeDiagramNode} from '../classes/node.class';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import { TreeDiagramNodeMaker } from "../classes/node-maker.class"
import {NodeData} from '../classes/NodeData';
import {Tree} from '../tree.component';

@Component({
  selector: '[treeDiagramNode]',
  styleUrls: [ './node.component.scss' ],
  templateUrl: './node.component.html',
})

export class Node {
  public node: TreeDiagramNode | TreeDiagramNodeMaker;
  public childrenTransform: SafeStyle;
  public transform: SafeStyle;
  public width;
  constructor(private nodesSrv: NodesListService,  private sanitizer: DomSanitizer){
  }
  @Input() set treeDiagramNode(guid) {
    this.node = this.nodesSrv.getNode(guid);
	  // const childTranslationX = -this.node.children.size * (  this.node.width/ 2 +Tree.ELEMENT_MARGIN)/2 +2* Tree.ELEMENT_MARGIN;
      const childTranslationX = 0;
	  this.childrenTransform = this.sanitizer.bypassSecurityTrustStyle(`translate(${childTranslationX}px, 45px)`);

	  // this.childrenTransform = this.sanitizer.bypassSecurityTrustStyle(`translate(calc(-50% + ${Math.round(this.node.width/2)}px), 45px)`))
    // this.childrenTransform = this.sanitizer.bypassSecurityTrustStyle(`translate(${this.node.childTranslation}px, 45px)`);
    // this.transform = this.sanitizer.bypassSecurityTrustStyle(`translate(${this.node.translationX}px, 0px )`);
    this.transform = this.sanitizer.bypassSecurityTrustStyle(`translate(0px, 0px )`);


  }

  @Output() public nodeClicked = new EventEmitter<TreeDiagramNode>();
  @Output() public nodeDropped = new EventEmitter<NodeDroppedEvent>();

  public nodeClick(child?: TreeDiagramNode): void {

    if (child) {
      this.nodeClicked.next(child);
    } else {
      this.nodeClicked.next(this.node);
    }
  }

  public onNodeDrop(event, node: TreeDiagramNode) {
	  const dropEvent = node.drop(event);
	  if (dropEvent) {
	    this.nodeDropped.next(dropEvent)
      }
  }

  public onTextClick(event) {

	  if (!this.node.readonly) {
		  event.stopPropagation();
	  }
  }
}
