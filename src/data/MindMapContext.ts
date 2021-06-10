import type { NodeState, RootState } from "./NodeState";

export const MindMapContextKey = 'mindmap';

export class MindMapContext {
  protected canSave: boolean;
  protected root: RootState;
  protected activeNode?: NodeState;
  protected parents: Map<number, NodeState>;
  
  constructor() {
    this.clearState();
  }

  getRoot(): RootState {
    return this.root;
  }

  getActiveNode(): NodeState | undefined {
    return this.activeNode;
  }

  protected updateActiveNode(node: NodeState | undefined) {
    this.activeNode = node;
  }

  getInitialNode(): NodeState {
    return {
      id: Date.now(),
      label: 'Press Space or double click to edit',
      active: false,
      editable: false,
      collapsed: false,
      children: []      
    };
  }

  getCanSave(): boolean {
    return this.canSave;
  }

  setCanSave(canSave: boolean): void {
    this.canSave = canSave;
  }
  
  disposeActiveNode(): void {
    this.setActiveNode(undefined);
  }

  parent(node: NodeState): NodeState | undefined {
    return this.parents.get(node.id);
  }

  protected addNode(parent: NodeState | RootState, newNode: NodeState) {
    parent.children.push(newNode);
  }

  protected addParent(node: NodeState, parent: NodeState | undefined) {
    if(parent) {
      this.parents.set(node.id, parent);
    }
  }

  protected deleteNode(parent: NodeState | RootState, node: NodeState) {
    const index = parent.children.findIndex(elem => elem.id === node.id);
    
    parent.children.splice(index, 1);  
  }

  protected deleteParent(node: NodeState) {
    this.parents.delete(node.id);
  }

  protected clearState(initialNode?: NodeState) {
    this.canSave = false;

    this.root = {
      children: []
    };

    if(initialNode) this.root.children.push(initialNode);

    this.activeNode = undefined;

    this.parents = new Map<number, NodeState>();
  }

  protected setInitialState() {
    const initialNode = this.getInitialNode();

    this.clearState(initialNode);
  }

  protected initChildren(children: NodeState[], parent: NodeState | undefined) {
    children.forEach(child => {     
      child.active = false;
      
      if(parent) {
        this.addParent(child, parent);
      }

      if(child.children.length > 0) {
        this.initChildren(child.children, child);
      }      
    });
  }

  protected updateState(children: NodeState[]) {
    this.parents = new Map<number, NodeState>();

    this.initChildren(children, undefined);  

    this.root.children = children;
    this.canSave = false;
    this.activeNode = undefined;
  }

  setNodeLabel(node: NodeState, label: string) {
    node.label = label;

    this.setCanSave(true);
  }

  setNodeActive(node: NodeState, active: boolean) {
    node.active = active;

    this.setCanSave(true);
  }

  setNodeEditable(node: NodeState, editable: boolean)  {
    node.editable = editable;

    this.setCanSave(true);
  }

  setNodeCollapsed(node: NodeState, collapsed: boolean) {
    node.collapsed = collapsed;

    this.setCanSave(true);
  }

  canMoveToLeftNode(node: NodeState): boolean {
    return this.parents.get(node.id) !== undefined;
  }

  canMoveToRightNode(node: NodeState): boolean {
    return !node.collapsed && node.children.length > 0;
  }

  canMoveToUpNode(node: NodeState): boolean {
    const index = this.parents.get(node.id)?.children?.indexOf(node);

    return index !== undefined && index > 0;
  }

  canMoveToDownNode(node: NodeState): boolean {
    const index = this.parents.get(node.id)?.children?.indexOf(node);
    const length = this.parents.get(node.id)?.children?.length || 0;
    
    return index !== undefined && index >= 0 && index < length - 1;
  }

  canActivateLeftNode(): boolean {
    return this.activeNode !== undefined && this.canMoveToLeftNode(this.activeNode);
  }

  canActivateRightNode(): boolean {
    return this.activeNode !== undefined && this.canMoveToRightNode(this.activeNode);
  }

  canActivateUpNode(): boolean {
    return this.activeNode !== undefined && this.canMoveToUpNode(this.activeNode);
  }

  canActivateDownNode(): boolean {
    return this.activeNode !== undefined && this.canMoveToDownNode(this.activeNode);
  }

  middleChildNode(node: NodeState): NodeState | undefined {
    if(node.children.length > 0) {
      const index = Math.floor((node.children.length - 1) / 2);
      
      return node.children[index];
    }

    return undefined;
  }

  upNode(node: NodeState): NodeState | undefined {
    const index = this.parents.get(node.id)?.children?.indexOf(node);
    
    if(index !== undefined && index > 0) {
      return this.parents.get(node.id)?.children[index-1];
    }

    return undefined;
  }

  downNode(node: NodeState): NodeState | undefined {
    const index = this.parents.get(node.id)?.children?.indexOf(node);
    const length = this.parents.get(node.id)?.children?.length || 0;
    
    if(index !== undefined && index >= 0 && index < length - 1) {
      return this.parents.get(node.id)?.children[index + 1];
    }

    return undefined;
  }

  setActiveNode(node: NodeState | undefined) {
    if(!node || !this.activeNode || node.id !== this.activeNode.id) {      
      if(this.activeNode) {
        this.setNodeActive(this.activeNode, false);
        
        this.activeNode.editable = false;
      }

      if(node) {
        this.setNodeActive(node, true);
      }

      this.updateActiveNode(node);
    }
  }

  createChildNode(parent: NodeState | undefined) {
    const newNode: NodeState = {
      id: Date.now(),
      label: '',
      active: false,
      editable: true,
      collapsed: false,
      children: []          
    };

    this.addNode(parent || this.root, newNode);    
    this.setActiveNode(newNode);

    if(parent) {
      this.addParent(newNode, parent);
      this.setNodeCollapsed(parent, false);
    }

    this.setCanSave(true);
  }

  removeNode(node: NodeState) {
    const parent = this.parent(node) || this.getRoot();
    const index = parent.children.indexOf(node);
    const length = parent.children.length;  

    if(!parent.id && length < 2) return;        
    
    this.deleteNode(parent, node);
    this.deleteParent(node);
    
    let focusIndex = parent.children.length - 1;
    
    if(parent.children.length > index) {
      focusIndex = index;
    }

    if(focusIndex >= 0) {
      const focusNode = parent.children[focusIndex];  
      this.setActiveNode(focusNode);        
    } else if(parent.id) {
      this.setActiveNode(parent as NodeState);
    }

    this.setCanSave(true);
  }

  setChildNodesCollapsed(node: NodeState, collapsed: boolean) {
    this.setNodeCollapsed(node, false);

    node.children.forEach(child => {
      if(!collapsed || child.children.length > 0) {
        this.setNodeCollapsed(child, collapsed);       
      }
    });
  }

  moveToLeftNode(node: NodeState) {
    if(this.canMoveToLeftNode(node)) {
      this.setActiveNode(this.parent(node));
    }
  }

  moveToRightNode(node: NodeState) {
    if(this.canMoveToRightNode(node)) {
      const childNode = this.middleChildNode(node);

      if(childNode) {
        this.setActiveNode(childNode);
      }
    }
  }

  moveToUpNode(node: NodeState) {
    if(this.canMoveToUpNode(node)) {
      const upNode = this.upNode(node);

      if(upNode) {
        this.setActiveNode(upNode);
      }
    }
  }

  moveToDownNode(node: NodeState) {
    if(this.canMoveToDownNode(node)) {
      const downNode = this.downNode(node);

      if(downNode) {
        this.setActiveNode(downNode);
      }
    }    
  }

  activateLeftNode() {
    if(this.activeNode && this.canActivateLeftNode()) {
      this.moveToLeftNode(this.activeNode);
    }
  }

  activateRightNode() {
    if(this.activeNode && this.canActivateRightNode()) {
      this.moveToRightNode(this.activeNode);
    }
  }

  activateUpNode() {
    if(this.activeNode && this.canActivateUpNode()) {
      this.moveToUpNode(this.activeNode);
    }
  }

  activateDownNode() {
    if(this.activeNode && this.canActivateDownNode()) {
      this.moveToDownNode(this.activeNode);
    }
  }

  saveToLocalStorage() {
    localStorage.setItem(MindMapContextKey, JSON.stringify(this.root.children));
    
    this.setCanSave(false);
  }

  loadFromLocalStorage() {
    let data = undefined;

    try {
      data = JSON.parse(localStorage.getItem(MindMapContextKey) || '');
    } catch(error) {
      console.error(error);
    }

    if(data && typeof data === 'object') {
      this.updateState(data);
    } else {
      this.setInitialState();
    }
  }
};
