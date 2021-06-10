<script lang="ts">
import { onMount, setContext } from "svelte";

import { MindMapContext, MindMapContextKey } from "../data/MindMapContext";

import ToolBar from "./ToolBar.svelte";
import Node from './Node.svelte';

const ctx = new MindMapContext(update);

let children = ctx.getRoot().children;
let canActivateLeftNode = ctx.canActivateLeftNode();
let canActivateUpNode = ctx.canActivateUpNode();
let canActivateDownNode = ctx.canActivateDownNode();
let canActivateRightNode = ctx.canActivateRightNode();
let canSave = ctx.getCanSave();

setContext(MindMapContextKey, ctx);

function update() {  
  children = ctx.getRoot().children;
  canActivateLeftNode = ctx.canActivateLeftNode();
  canActivateUpNode = ctx.canActivateUpNode();
  canActivateDownNode = ctx.canActivateDownNode();
  canActivateRightNode = ctx.canActivateRightNode();
  canSave = ctx.getCanSave();
}

function dispose(evt: MouseEvent) {  
  ctx.disposeActiveNode();
}

onMount(() => {
  ctx.loadFromLocalStorage();
})
</script>

<div class="container">
  <ToolBar 
    {canActivateDownNode}
    {canActivateLeftNode}
    {canActivateRightNode}
    {canActivateUpNode}
    {canSave}
  />
  <ul class="mindmap" on:click={dispose}>
    {#each children as node, index}
      <Node  
        {node}
        tabIndex={index}
      />
    {/each}
  </ul>
</div>
