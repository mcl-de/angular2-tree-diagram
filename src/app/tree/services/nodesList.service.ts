import { ElementRef, Injectable } from '@angular/core';
import {TreeDiagramNodesList} from '../classes/nodesList.class'
import {NodeData} from '../classes/NodeData';

@Injectable()
export class NodesListService {
  private _nodesList: TreeDiagramNodesList;

  public loadNodes(nodes: NodeData[], config){
    this._nodesList = new TreeDiagramNodesList(nodes, config)
    return this._nodesList
  }

  public getNodes() {
    return this._nodesList.values()
  }

  public getNodesSerialized() {
    return this._nodesList.serialize();
  }

  public getNode(guid){
    return guid && this._nodesList.getNode(guid)
  }

  public newNode(){
    this._nodesList.newNode()
  }

  public makerNode(){
    return this._nodesList.makerGuid
  }

}