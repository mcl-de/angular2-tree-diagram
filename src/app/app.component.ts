/**
 * Angular 2 decorators and services
 */
import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {AppState} from './app.service';
import {TreeDiagramNode} from './tree/classes/node.class';
import {Tree, TreeConfig, TreeSizeConfig} from './tree/tree.component';

/**
 * App Component
 * Top Level Component
 */
@Component({
	selector: 'app',
	encapsulation: ViewEncapsulation.None,
	styleUrls: [
		'./app.component.css'
	],
	template: `
		<tree-diagram
			[data]="tree"
			(nodeClicked)="onNodeClick($event)"
			#treeComponent
		></tree-diagram>
		<button (click)="logValues()">Log Values</button>
		<button (click)="logValuesSerialized()">Log Values Serialized</button>
		<button (click)="changeTreeInput()">Change Tree Input</button>


	`
})
export class AppComponent implements OnInit {

	public treeConfig: TreeSizeConfig = {
		nodeWidth: 100,
		nodeHeight: 80,
		allowDrag: false,
		allowScroll: false,
		showNewNode: false
	};
	public tree: TreeConfig;

	@ViewChild('treeComponent') private treeComponent: Tree;
	private simpleTreeJson = [{
		'guid': 'bc4c7a02-5379-4046-92be-12c67af4295a',
		'displayName': 'Elentrix',
		'readonly': true
	}];

	private complexTreeJson;
	private isComplex = true;

,

	constructor(public appState: AppState) {
	}

	public async ngOnInit() {
		this.complexTreeJson = await System.import('../assets/mock-data/mock-data.json');
		this.tree = {
			json: this.complexTreeJson,
			config: this.treeConfig
		};
	}

	public changeTreeInput() {
		this.tree = {
			json: this.isComplex ? this.simpleTreeJson : this.complexTreeJson,
			config: this.treeConfig
		};
		this.isComplex = !this.isComplex;

	}

	public logValues() {
		console.debug(this.treeComponent.getValues());
	}

	public logValuesSerialized() {
		console.debug(this.treeComponent.getValuesSerialized());
	}

	public onNodeClick(node: TreeDiagramNode) {
		console.debug(node);
	}

}
