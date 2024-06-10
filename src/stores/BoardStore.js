import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import createPanZoom from "panzoom";

export const useBoardStore = defineStore("boardStore", () => {
  /**
   * @type {import("panzoom").PanZoom}
   */
  let panzoom = null; // A panzoom object to initialized on board mounting
  let board = null; // A board HTML instance

  const state = reactive({ maxZoom: 3, minZoom: 0.4, x: 0, y: 0, zoom: 1 });

  const x = computed(() => state.x);
  const y = computed(() => state.y);
  const zoom = computed({
    get() {
      return state.zoom;
    },
    set(value) {
      // The zoom takes a factor, not zoom value => needed conversion
      const factor = value / state.zoom;
      state.zoom = value;

      const center = getCenter();
      panzoom.zoomTo(center.x, center.y, factor);
    },
  });

  /**
   * Initializes a board element applying a panzoom plugin to it.
   * @param {HTMLElement} element A board HTML reference
   */
  function initBoard(element) {
    board = element;
    _initPanzoom(board);
  }

  /**
   * @returns An reference to board HTML element
   */
  function getBoard() {
    return board;
  }

  /******* Panzooming *******/

  /**
   * Initializes a panzoom state for a given board.
   * @param {HTMLElement} board
   * @returns a panzoom instance controlling the board
   */
  function _initPanzoom(board) {
    panzoom = createPanZoom(board, {
      maxZoom: state.maxZoom,
      minZoom: state.minZoom,
      smoothScroll: false,
      zoomSpeed: 1.2,
    });

    // Update board state on panning, zooming
    panzoom.on("pan", () => {
      const pzInfo = panzoom.getTransform();

      // x,y are inverted
      state.x = parseInt(-pzInfo.x);
      state.y = parseInt(-pzInfo.y);
    });

    panzoom.on("zoom", () => {
      const pzInfo = panzoom.getTransform();

      // Ensuring that x,y are correct before zooming (zoomend event does not seem to work)
      panzoom.smoothMoveTo(-state.x, -state.y); // Panzoom API has reverted x, y orientations for whatever reasons

      state.zoom = pzInfo.scale; // Update the scale value
    });

    return panzoom;
  }

  /**
   * Moves the element to an x,y position of the board
   * @param {Number} x An x coordinate to move to
   * @param {Number} y A y coordinate to move to
   * @param {Number} zoomScale A scale of the zoom to be set on move
   */
  function moveTo(x, y, zoomScale = 1) {
    try {
      state.x = x;
      state.y = y;

      // Setting a zoom value will ensure moving to current x,y coordinates
      zoom.value = zoomScale;
    } catch (e) {
      throw new Error("An error ocurred during panzoom! ", e);
    }
  }

  /**
   * @returns A width of the board
   */
  function getWidth() {
    return board.offsetWidth;
  }

  /**
   * @returns A height of the board
   */
  function getHeight() {
    return board.offsetHeight;
  }

  /**
   * @returns The center coordinates of the current board position
   */
  function getCenter() {
    return {
      x: parseInt(state.x + getWidth() / 2),
      y: parseInt(state.y + getHeight() / 2),
    };
  }

  return {
    x,
    y,
    zoom,

    initBoard,
    getBoard,
    moveTo,

    getHeight,
    getWidth,
    getCenter,
  };
});
