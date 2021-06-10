<script lang="ts">
import { afterUpdate, getContext } from "svelte";

import { MindMapContext, MindMapContextKey } from "../data/MindMapContext";
import type { NodeState } from "../data/NodeState";

export let node: NodeState;
export let tabIndex: number;

let numClicks = 0;
let childrenCollapsed = false;
let article: HTMLElement;
let ctx = getContext<MindMapContext>(MindMapContextKey);

function updateArticleContent(content: string) {
  article.textContent = content;
}

function updateArticleFocus(active: boolean) {
  if(active) {
    article.focus();
  } else {
    article.blur();
  }
}

function onNodeInput() {       
  ctx.setNodeLabel(
    node, 
    article.textContent.replace(/(<([^>]+)>)/gi, "") || ''
  );
};

function onNodeClicked(evt: MouseEvent) {
  evt.stopPropagation();

  numClicks++;

  if(!node.active) {
    ctx.setActiveNode(node);
  } else {
    ctx.setNodeCollapsed(node, !node.collapsed);
  }

  setTimeout(() => {
    if(numClicks > 1 && !node.editable) {
      ctx.setNodeEditable(node, true);
    }
    numClicks = 0;
  }, 300);
};

function onNodeKeyPressed(evt: KeyboardEvent) {
  if(evt.code === 'Space' && !node.editable) {
    evt.preventDefault();

    ctx.setNodeEditable(node, true);
  } else if(evt.code === 'Tab') {
    evt.preventDefault();

    ctx.createChildNode(node);
  } else if(evt.code === 'Enter' || evt.code === 'NumpadEnter') {
    evt.preventDefault();

    if(!node.editable) {        
      ctx.createChildNode(ctx.parent(node));        
    } else {
      ctx.setNodeEditable(node, false);
    }
  } else if(evt.code === 'Delete') {
    if(!node.editable) {
      ctx.removeNode(node);        
    }
  } else if(evt.code === 'ArrowLeft' || evt.code === 'Numpad4') {
    if(!node.editable) {
      ctx.moveToLeftNode(node);
    }
  } else if(evt.code === 'ArrowRight' || evt.code === 'Numpad6') {
    if(!node.editable) {        
      ctx.moveToRightNode(node);
    } 
  } else if(evt.code === 'ArrowUp' || evt.code === 'Numpad8') {
    ctx.moveToUpNode(node);
  } else if(evt.code === 'ArrowDown' || evt.code === 'Numpad2') {
    ctx.moveToDownNode(node);
  } else if(evt.code === 'KeyD') {
    if(evt.shiftKey) {
      if(!node.editable) {
        childrenCollapsed = !childrenCollapsed;

        ctx.setChildNodesCollapsed(node, childrenCollapsed);        
      }
    } else {
      if(!node.editable) {
        ctx.setNodeCollapsed(node, !node.collapsed);
      }
    }      
  }
}

afterUpdate(() => {
  updateArticleContent(node.label);
  updateArticleFocus(node.active);
});
</script>

<li>
  <article
    class:collapsed={node.collapsed}
    class:editable={node.editable}
    class:active={node.active}
    tabindex={tabIndex}
    contenteditable={node.editable}
    on:input={onNodeInput}
    on:click={onNodeClicked}
    on:keydown={onNodeKeyPressed}
    bind:this={article}
  />
  {#if !node.collapsed && node.children.length}
    <ul>
      {#each node.children as child, index}
        <svelte:self  
          node={child}
          tabIndex={index}
        />
      {/each}
    </ul>
  {/if}
  <ul></ul>
</li>
