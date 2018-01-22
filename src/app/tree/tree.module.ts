import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { Tree } from './tree.component'
import { Node } from './node'
import {NxControlModule} from 'negsoft-control';

@NgModule({
  declarations: [
    /**
     * Components / Directives/ Pipes
     */
    Tree,
    Node
  ],
  imports: [
    CommonModule,
      NxControlModule
  ],
  exports: [
    Tree,
    Node
  ],
  providers: []
})
export class TreeDiagram {

}