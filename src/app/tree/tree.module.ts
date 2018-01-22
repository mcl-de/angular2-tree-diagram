import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { Tree } from './tree.component'
import { Node } from './node'

@NgModule({
  declarations: [
    /**
     * Components / Directives/ Pipes
     */
    Tree,
    Node
  ],
  imports: [
    CommonModule
  ],
  exports: [
    Tree,
    Node
  ],
  providers: []
})
export class TreeDiagram {

}