<template>
  <div class="box1" @contextmenu="onContextMenu($event)">
    Right click to show contextmenu !
  </div>
  <div class="box4">
    You can open examples\views\BasicComponent.vue file view complete source code.
  </div>

  <!--this is component mode of context-menu-->
  <context-menu
    v-model:show="show"
    :options="optionsComponent"
  >
    <context-menu-item label="Simple item" @click="alertContextMenuItemClicked('Item1')" />
    <context-menu-item label="Item with a icon" icon="icon-reload-1" @click="alertContextMenuItemClicked('Item2')" />
    <context-menu-item label="Test item dynamic show and hide" :clickClose="false" @click="showItem=!showItem" />
    <context-menu-item v-if="showItem" label="Click the item above to show/hide me" />
    <context-menu-sperator v-if="showItem" />
    <context-menu-item :label="itemText" :clickClose="false" @click="changeLabelText" />
    <context-menu-group label="Menu with child">
      <context-menu-item label="Item1" @click="alertContextMenuItemClicked('Item1-1')" />
      <context-menu-item label="Item1" @click="alertContextMenuItemClicked('Item1-2')" />
    </context-menu-group>
    <context-menu-group label="Menu with child child child">
      <context-menu-item label="Item1" @click="alertContextMenuItemClicked('Item2-1')" />
      <context-menu-sperator />
      <context-menu-group label="Child with v-for 50">
        <context-menu-item v-for="index of 50" :key="index" :label="'Item3-'+index" @click="alertContextMenuItemClicked('Item2-3-' + index)" />
      </context-menu-group>
      <context-menu-group label="Childs">
        <context-menu-item label="Item1-1" @click="alertContextMenuItemClicked('Item3-1-1')" />
        <context-menu-item label="Item1-2" @click="alertContextMenuItemClicked('Item3-1-2')" />
        <context-menu-sperator />
        <context-menu-group label="Childs">
          <context-menu-item label="Item2-1" @click="alertContextMenuItemClicked('Item3-2-1')" />
          <context-menu-item label="Item2-2" @click="alertContextMenuItemClicked('Item3-2-2')" />
        </context-menu-group>
      </context-menu-group>
    </context-menu-group>
  </context-menu>

  
  <!--Demo scripts-->
  <div class="box2">
    <pre>
      <code class="language-html">  
&lt;!--this is component mode of context-menu--&gt;
&lt;context-menu
v-model:show="show"
:options="optionsComponent"
&gt;
&lt;context-menu-item label="Simple item" @click="alertContextMenuItemClicked('Item1')" /&gt;
&lt;context-menu-item label="Item with a icon" icon="icon-reload-1" @click="alertContextMenuItemClicked('Item2')" /&gt;
&lt;context-menu-group label="Menu with child"&gt;
  &lt;context-menu-item label="Item1" @click="alertContextMenuItemClicked('Item1-1')" /&gt;
  &lt;context-menu-item label="Item1" @click="alertContextMenuItemClicked('Item1-2')" /&gt;
&lt;/context-menu-group&gt;
&lt;context-menu-sperator /&gt;
&lt;context-menu-group label="Menu with child child child"&gt;
  &lt;context-menu-item label="Item1" @click="alertContextMenuItemClicked('Item2-1')" /&gt;
  &lt;context-menu-item label="Item2" @click="alertContextMenuItemClicked('Item2-2')" /&gt;
  &lt;context-menu-sperator /&gt;
  &lt;context-menu-group label="Child with v-for 50"&gt;
    &lt;context-menu-item v-for="index of 50" :key="index" :label="'Item3-'+index" @click="alertContextMenuItemClicked('Item2-3-' + index)" /&gt;
  &lt;/context-menu-group&gt;
  &lt;context-menu-group label="Childs"&gt;
    &lt;context-menu-item label="Item1-1" @click="alertContextMenuItemClicked('Item3-1-1')" /&gt;
    &lt;context-menu-item label="Item1-2" @click="alertContextMenuItemClicked('Item3-1-2')" /&gt;
    &lt;context-menu-sperator /&gt;
    &lt;context-menu-group label="Childs"&gt;
      &lt;context-menu-item label="Item2-1" @click="alertContextMenuItemClicked('Item3-2-1')" /&gt;
      &lt;context-menu-item label="Item2-2" @click="alertContextMenuItemClicked('Item3-2-2')" /&gt;
    &lt;/context-menu-group&gt;
  &lt;/context-menu-group&gt;
&lt;/context-menu-group&gt;
&lt;/context-menu&gt;
      </code>
    </pre>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'
import { MenuOptions } from '../../src/ContextMenuDefine';

export default defineComponent({
  mounted() {
    (window as unknown as {
      hljs: {
        highlightAll: () => void
      }
    }).hljs?.highlightAll?.();
  },
  data() {
    return {
      show: false,
      showItem: true,
      itemText: 'Test item dynamic change label',
      optionsComponent: {
        iconFontClass: 'iconfont',
        customClass: "class-a",
        zIndex: 3,
        minWidth: 230,
        x: 500,
        y: 200
      } as MenuOptions,
    }
  },
  methods: {
    onContextMenu(e : MouseEvent) {
      e.preventDefault();
      //Set the mouse position
      this.optionsComponent.x = e.x;
      this.optionsComponent.y = e.y;
      //Show menu
      this.show = true;
    },
    changeLabelText() {
      this.itemText = (this.itemText == 'My label CHANGED!' ? 'Test item dynamic change label' : 'My label CHANGED!');
    },
    alertContextMenuItemClicked(name: string) {
      alert('You clicked ' + name + ' !');
    },
  }
});
</script>