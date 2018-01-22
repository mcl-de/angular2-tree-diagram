import {TreeDiagramNodeMaker} from './node-maker.class';
import {TreeDiagramNode} from './node.class';
import {NodeData} from './NodeData';
import {Tree, TreeSizeConfig} from '../tree.component';

export class Subtree {
	root: TreeDiagramNode;
	children: [TreeDiagramNode| Subtree][];
}

export class TreeDiagramNodesList {
	public roots: TreeDiagramNode[];
	public makerGuid: string;
	public draggingNodeGuid;
	private _nodesList = new Map();
	private _nodeTemplate = {
		displayName: 'New node',
		children: [],
		guid: '',
		parentId: null
	};
	public treeHeight = 0;

	constructor(_nodes: NodeData[], private config) {

		_nodes.forEach((_node) => {
			this._nodesList.set(_node.guid, new TreeDiagramNode(_node, config, this.getThisNodeList.bind(this)));
		});
		this._makeRoots();
		this.calculateSizes(_nodes, config);
		this.makerGuid = this.uuidv4();
		let node = {
			guid: this.makerGuid,
			parentId: 'root',
			children: [],
			displayName: 'New node'
		};
		let maker = new TreeDiagramNodeMaker(node, this.config, this.getThisNodeList.bind(this));
		this._nodesList.set(this.makerGuid, maker);
	}

	public destroy(guid: string) {
		let target = this.getNode(guid);
		if (target.parentId) {
			let parent = this.getNode(target.parentId);
			parent.children.delete(guid);
		}
		if (target.hasChildren()) {
			target.children.forEach((child: string) => {
				let theNode = this.getNode(child);
				theNode.parentId = null;
			});
		}
		this._nodesList.delete(guid);
		this._makeRoots();
		console.warn(this.values());
	}

	public getNode(guid: string): TreeDiagramNode {
		return this._nodesList.get(guid);
	}

	public getThisNodeList() {
		return this;
	}

	public newNode(parentId = null) {
		let _nodeTemplate = Object.assign({}, this._nodeTemplate);
		_nodeTemplate.guid = this.uuidv4();
		_nodeTemplate.parentId = parentId;
		this._nodesList.set(
			_nodeTemplate.guid,
			new TreeDiagramNode(_nodeTemplate, this.config, this.getThisNodeList.bind(this))
		);
		this._makeRoots();
		return _nodeTemplate.guid;
	}

	public rootNode(guid: string) {
		let node = this.getNode(guid);
		node.isDragging = false;
		node.isDragover = false;
		if (node.parentId) {
			let parent = this.getNode(node.parentId);
			parent.children.delete(guid);
		}
		node.parentId = null;
		this._makeRoots();
		let maker = this.getNode(this.makerGuid);
		maker.isDragging = false;
		maker.isDragover = false;
	}

	public serialize() {
		let out = [];
		this._nodesList.forEach((node: TreeDiagramNode) => {
			let json: any = {
				guid: node.guid,
				displayName: node.displayName,
				parentId: node.parentId
			};
			json.children = Array.from(node.children);

			out.push(json);
		});
		return out;
	}

	public toggleSiblings(guid: string) {
		throw new Error('Toggling sibblings is not supported');
		// let target = this.getNode(guid);
		// if (target.parentId) {
		//   let parent = this.getNode(target.parentId)
		//   parent.children.forEach((nodeGuid) => {
		//     if (nodeGuid === guid) {
		//       return;
		//     }
		//     this.getNode(nodeGuid).toggle(false)
		//   })
		// } else {
		//   for (let root of this.roots) {
		//     if (root.guid === guid) {
		//       continue;
		//     }
		//     root.toggle(false)
		//   }
		// }
	}

	public transfer(origin: string, target: string) {
		throw new Error('Transfering is not supported');
		// let _origin = this.getNode(origin);
		// let _target = this.getNode(target);
		// _origin.isDragover = false;
		// _origin.isDragging = false;
		// _target.isDragover = false;
		// if (_origin.parentId === target || origin === target) {
		//   return;
		// }
		// let remakeRoots = _origin.isRoot();
		// if (_origin.parentId) {
		//   let _parent = this.getNode(_origin.parentId);
		//   _parent.children.delete(origin);
		//   if (!_parent.hasChildren()) {
		//     _parent.toggle(false)
		//   }
		// }
		// _target.children.add(origin);
		//
		// _origin.parentId = target;
		// remakeRoots && this._makeRoots()
		//
		// this.serialize()
	}

	public values() {
		return this._nodesList.values();
	}

	private _makeRoots() {
		this.roots = Array.from(this.values()).filter((node: TreeDiagramNode) => node.isRoot());
	}

	private calculateSizes(nodes: NodeData[], config: TreeSizeConfig) {
		// First part: Convert into array, where the nodes are stored at the array index of the layer they are in

		const temp: TreeDiagramNode[][] = [];
		let processingObjects: TreeDiagramNode[] = this.roots;
		let nextRoundProcessingObjects: TreeDiagramNode[] = [];

		while (processingObjects.length > 0) {
			temp.push(processingObjects);

			processingObjects.forEach((processingObject) => {
				processingObject.children.forEach((child) => {
					nextRoundProcessingObjects.push(this.getNode(child));
				});
			});

			processingObjects = nextRoundProcessingObjects;
			nextRoundProcessingObjects = [];
		}
		this.treeHeight = (config.nodeHeight + 60) * temp.length

		// Second part. Go from bottom to top and form subtrees
		// First round of second part. Builds the first set of subtrees
		if (temp.length >= 2) {
			processingObjects = temp[temp.length - 1];
			let subtrees: Subtree[] = [];
			while (processingObjects.length > 0) {
				// Pick the left most node, find all childrens of its parent and form the sub tree
				const node = processingObjects[0];
				const parent = this.getNode(node.parentId);
				const children = [];
				parent.children.forEach((child) => {
					const childNode = this.getNode(child);
					children.push(childNode);
					const index = processingObjects.findIndex((value) => value.guid === child);
					processingObjects.splice(index, 1);
				});
				const width = children.length * (config.nodeWidth + Tree.ELEMENT_MARGIN * 2) - Tree.ELEMENT_MARGIN * 2;
				parent.totalWidth = width;
				const subTree: Subtree = {
					root: parent,
					children
				};
				subtrees.push(subTree);
			}

			// Secound round of second part. Go up each layer and merge all subtrees that got a common parent on the current layer
			let processingLayer = temp.length - 2;
			let nextRoundSubTrees = [];
			while (processingLayer >= 1) {
				processingObjects = temp[processingLayer];
				// Take each existing subtree, try to process it, then remove it from the list of processingobjects

				while (processingObjects.length > 0) {
					const node = processingObjects[0];

					const parent = this.getNode(node.parentId);
					const children = [];
					parent.children.forEach((child) => {
						const subtree = subtrees.find((sub) => sub.root.guid === child);
						// If the node we are processing is a subtree, push the subtree, not only the childnode
						if (subtree) {
							children.push(subtree);

						} else {
							const childNode = this.getNode(child);
							children.push(childNode);
						}
						const index = processingObjects.findIndex((value) => value.guid === child);
						processingObjects.splice(index, 1);
					});
					const newTree = this.mergeTrees(parent, children, config);
					nextRoundSubTrees.push(newTree);

				}
				processingLayer--;
				subtrees = nextRoundSubTrees;
				nextRoundSubTrees = [];
			}
			// 3. Assign the translations to the nodes
			// 3.1 Start with the root layers
			let layerWidth = 0;
			subtrees.forEach((subtree) => {
				layerWidth += subtree.root.totalWidth;
			});
			layerWidth /= -2;
			subtrees.forEach((subtree) => {
				subtree.root.translationX = layerWidth + subtree.root.totalWidth / 2;

				layerWidth += subtree.root.totalWidth;
			});
			// 3.2 Now iterate the childs and fix their size
			subtrees.forEach((subtree) => {
				this.assignStatsToNodes(subtree, config.nodeWidth);
			});

		} else {
			// TODO: Simple stucture with only one layer
			temp[0].forEach((node, index) => {
				node.translationX = index * config.nodeWidth * Tree.ELEMENT_MARGIN;
			});
		}


	}

	private assignStatsToNodes(tree: Subtree, nodeWidth: number) {
		const nodeWidthWithMargin = nodeWidth + Tree.ELEMENT_MARGIN * 2;
		const subtrees = tree.children;
		let layerWidth = 0;
		subtrees.forEach((subtree) => {
			if (this.isSubtree(subtree)) {
				layerWidth += subtree.root.totalWidth;
			} else if (subtree instanceof TreeDiagramNode) {
				layerWidth += nodeWidthWithMargin;
			}

		});
		layerWidth /= -2;
		subtrees.forEach((subtree) => {
			if (this.isSubtree(subtree)) {
				subtree.root.translationX = layerWidth + subtree.root.totalWidth / 2;
				this.assignStatsToNodes(subtree, nodeWidth);
				layerWidth += subtree.root.totalWidth;
			} else if (subtree instanceof TreeDiagramNode) {
				subtree.translationX = layerWidth + nodeWidthWithMargin / 2 ;

			}

		});
	}

	private mergeTrees(root: TreeDiagramNode, children: [TreeDiagramNode| Subtree][], config: TreeSizeConfig ): Subtree {
		// If we want to improve the placement of the subtrees, this is the method to do it
		let width = 0;
		children.forEach((child) => {
			if (child instanceof TreeDiagramNode) {
				width += config.nodeWidth + Tree.ELEMENT_MARGIN * 2;
			} else if (this.isSubtree(child)) {
				width += child.root.totalWidth + Tree.ELEMENT_MARGIN * 2;
			}
		});
		width -= 2 * Tree.ELEMENT_MARGIN
		root.totalWidth = width;
		return {
			root, children
		};
	}

	private isSubtree(object: any): object is Subtree {
		return object.root !== undefined;
	}

	private uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

}