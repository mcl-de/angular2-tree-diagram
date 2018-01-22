import {NxControl} from 'negsoft-control';

export interface NodeData {
	guid: string;
	displayName: string;
	children: string[];
	readonly: boolean;
	controls: NxControl[];

}