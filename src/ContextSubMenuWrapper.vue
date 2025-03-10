<script lang="ts">
import { defineComponent, h, onBeforeUnmount, onMounted, PropType, provide, ref, renderSlot, toRefs, VNode, watch } from 'vue-demi'
import { MenuConstOptions, MenuItem, MenuOptions, MenuPopDirection } from './ContextMenuDefine'
import { addOpenedContextMenu, removeOpenedContextMenu } from './ContextMenuMutex';
import ContextSubMenuConstructor, { SubMenuContext, SubMenuParentContext } from './ContextSubMenu.vue';

export type GlobalHasSlot = (name: string) => boolean;
export type GlobalRenderSlot = (name: string, params: Record<string, unknown>) => VNode;

/**
 * Context menu component
 */
export default defineComponent({
  name: 'ContextMenu',
  emits: [ 'update:show', 'close' ],
  props: {
    /**
     * Menu options
     */
    options: {
      type: Object as PropType<MenuOptions>,
      default: null
    },
    /**
     * Show menu?
     */
    show: {
      type: Boolean,
      default: false
    },
    /**
     * Current container, For calculation only
     */
    container: {
      type: Object as PropType<HTMLElement>,
      default: null
    },
    /**
     * Make sure is user set the custom container.
     */
    isFullScreenContainer: {
      type: Boolean,
      default: true
    },
  },
  setup(props, ctx) {
    const {
      options,
      show,
      container,
    } = toRefs(props);

    onMounted(() => {
      if (show)
        openMenu();
    })
    onBeforeUnmount(() => {
      removeBodyEvents();
    });

    watch(show, (v: boolean) => {
      if(v) {
        openMenu();
      } else {
        removeBodyEvents();
      }
    });

    const instance = { closeMenu };
    
    function openMenu() {
      installBodyEvents();
      addOpenedContextMenu(instance);
    }
    function closeMenu(fromItem?: MenuItem|undefined) {
      ctx.emit("update:show", false);
      ctx.emit("close", fromItem);
      
      removeOpenedContextMenu(instance);
    }

    //Expose instance function
    ctx.expose({
      closeMenu: closeMenu,
    });

    function installBodyEvents() {
      setTimeout(() => {
        document.addEventListener("click", onBodyClick, true);
        document.addEventListener("contextmenu", onBodyClick, true);
        document.addEventListener("scroll", onBodyScroll, true);
        if (!props.isFullScreenContainer && container.value)
          container.value.addEventListener("scroll", onBodyScroll, true);
        if (options.value.keyboardControl !== false)
          document.addEventListener('keydown', onMenuKeyDown);
      }, 50);
    }
    function removeBodyEvents() {
      document.removeEventListener("contextmenu", onBodyClick, true);
      document.removeEventListener("click", onBodyClick, true);
      document.removeEventListener("scroll", onBodyScroll, true);
      if (!props.isFullScreenContainer && container.value)
        container.value.removeEventListener("scroll", onBodyScroll, true);
      if (options.value.keyboardControl !== false)
        document.removeEventListener('keydown', onMenuKeyDown);
    }

    //For keyboard event, remember which submenu is active
    const currentOpenedMenu = ref<SubMenuContext|null>();
    provide('globalSetCurrentSubMenu', (menu: SubMenuContext|null) => currentOpenedMenu.value = menu);

    function onMenuKeyDown(e: KeyboardEvent) {
      let handled = true;
      let key;
      //Handle keyboard event
      switch(e.key) {
        case "Escape": {
          if (currentOpenedMenu.value?.isTopLevel() === false) {
            currentOpenedMenu.value?.closeCurrentSubMenu();
          } else {
            closeMenu();
          }
          break;
        }
        case "ArrowDown":
          currentOpenedMenu.value?.moveCurrentItemDown();
          break;
        case "ArrowUp":
          currentOpenedMenu.value?.moveCurrentItemUp();
          break;
        case "Home":
          currentOpenedMenu.value?.moveCurrentItemFirst();
          break;
        case "End":
          currentOpenedMenu.value?.moveCurrentItemLast();
          break;
        case "ArrowLeft": {
          if (!currentOpenedMenu.value?.closeSelfAndActiveParent())
            options.value.onKeyFocusMoveLeft?.();
          break;
        }
        case "ArrowRight":
          if (!currentOpenedMenu.value?.openCurrentItemSubMenu())
            options.value.onKeyFocusMoveRight?.();
          break;
        case "Enter":
          currentOpenedMenu.value?.triggerCurrentItemClick(e);
          break;
        default:
          // Handle simple one-digit or one-letter shortcuts
          if(e.key >="0" && e.key <="9"){
            key = e.key;
          }else if(e.code >= "KeyA" && e.code <= "KeyZ"){
            // Use event code to prevent the keyboard from having another language letter
            key = e.code.replace("Key",""); 
          }
          if(key !== undefined){
            currentOpenedMenu.value?.moveCurrentItemByShortcut(key);
          } else {
            handled = false;
          }
          break;
      }
      if (handled && currentOpenedMenu.value) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
    function onBodyScroll() {
      //close when docunment scroll
      if (options.value.closeWhenScroll !== false)
        closeMenu();
    }
    function onBodyClick(e: MouseEvent) {
      checkTargetAndClose(e.target as HTMLElement);
    }
    function checkTargetAndClose(target: HTMLElement) {
      //Loop target , Check whether the currently clicked element belongs to the current menu.
      // If yes, it will not be closed
      while (target) {
        if (target.classList && target.classList.contains('mx-menu-host'))
          return;
        target = target.parentNode as HTMLElement;
      }
      
      //Close menu
      removeBodyEvents();
      closeMenu();
    }
    
    //provide globalOptions for child use
    provide('globalOptions', options.value);
    provide('globalCloseMenu', closeMenu);
    provide('globalTheme', options.value?.theme || 'light');
    provide('globalIsFullScreenContainer', props.isFullScreenContainer);
    provide('globalClickCloseClassName', options.value?.clickCloseClassName);
    provide('globalIgnoreClickClassName', options.value?.ignoreClickClassName);
    provide('globalIconFontClass', options.value?.iconFontClass || 'iconfont');
    //check slot exists
    provide('globalHasSlot', (name: string) => {
      return ctx.slots[name] !== undefined;
    });
    //render slot
    provide('globalRenderSlot', (name: string, params: Record<string, unknown>) => {
      return renderSlot(ctx.slots, name, { ...params }, () => [ h('span', 'Render slot failed') ], false);
    });
    //provide menuContext for child use
    provide('menuContext', {
      zIndex: options.value.zIndex || MenuConstOptions.defaultZindex,
      container: container.value as unknown as HTMLElement,
      adjustPadding: { x: 0, y: 0 },
      getParentAbsY: () => options.value.x,
      getParentAbsX: () => options.value.y,
      getParentX: () => 0,
      getParentY: () => 0,
      getParentWidth: () => 0, 
      getParentHeight: () => 0, 
      getPositon: () => [options.value.x,options.value.y],
      closeOtherSubMenuWithTimeOut: () => {/* Do nothing */}, 
      checkCloseOtherSubMenuTimeOut: () => false, 
      addOpenedSubMenu: () => {/* Do nothing */},
      closeOtherSubMenu: () => {/* Do nothing */},
      getParentContext: () => null,
      getSubMenuInstanceContext: () => null,
      getElement: () => null,
      addChildMenuItem: () => {/* Do nothing */},
      removeChildMenuItem: () => {/* Do nothing */},
      markActiveMenuItem: () => {/* Do nothing */},
      markThisOpenedByKeyBoard: () => {/* Do nothing */},
      isOpenedByKeyBoardFlag: () => false,
      isMenuItemDataCollectedFlag: () => false,
    } as SubMenuParentContext);

    return () => {
      //Hidden
      if (!show.value)
        return [];

      //Create SubMenu
      return [
        h('div', {
          class: 'mx-menu-ghost-host', 
        }, [
          h(ContextSubMenuConstructor, {
            class: 'mx-menu-host',
            items: options.value?.items,
            adjustPosition: options.value?.adjustPosition,
            maxWidth: options.value.maxWidth || MenuConstOptions.defaultMaxWidth,
            minWidth: options.value.minWidth || MenuConstOptions.defaultMinWidth,
            direction: options.value.direction || MenuConstOptions.defaultDirection as MenuPopDirection,
          }, {
            default: ctx.slots.default,
          })
        ])
      ];
    }
  },
})
</script>

<style>
.mx-menu-ghost-host {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  overflow: hidden;
  pointer-events: none;
}
.mx-menu-ghost-host.fullscreen {
  position: fixed;
}
</style>
