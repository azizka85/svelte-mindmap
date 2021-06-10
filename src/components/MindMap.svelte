<script lang="ts">
import { setContext } from "svelte";

import { MindMapContext, MindMapContextKey } from "../data/MindMapContext";

import ToolBar from "./ToolBar.svelte";
import Node from './Node.svelte';

const ctx = new MindMapContext();

ctx.loadFromLocalStorage();

setContext(MindMapContextKey, ctx);
</script>

<div class="container">
  <ToolBar />
  <ul class="mindmap">
    {#each ctx.getRoot().children as node, index}
      <Node  
        {node}
        tabIndex={index}
      />
    {/each}
  </ul>
</div>
