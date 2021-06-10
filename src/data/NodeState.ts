export interface RootState {
  id?: number;
  children: NodeState[];
};

export interface NodeState extends RootState {  
  id: number;
  label: string;
  active: boolean;
  editable: boolean;
  collapsed: boolean;
};
