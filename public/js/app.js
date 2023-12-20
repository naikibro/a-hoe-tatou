/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/alpinejs/dist/module.esm.js":
/*!**************************************************!*\
  !*** ./node_modules/alpinejs/dist/module.esm.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ module_default)
/* harmony export */ });
// packages/alpinejs/src/scheduler.js
var flushPending = false;
var flushing = false;
var queue = [];
var lastFlushedIndex = -1;
function scheduler(callback) {
  queueJob(callback);
}
function queueJob(job) {
  if (!queue.includes(job))
    queue.push(job);
  queueFlush();
}
function dequeueJob(job) {
  let index = queue.indexOf(job);
  if (index !== -1 && index > lastFlushedIndex)
    queue.splice(index, 1);
}
function queueFlush() {
  if (!flushing && !flushPending) {
    flushPending = true;
    queueMicrotask(flushJobs);
  }
}
function flushJobs() {
  flushPending = false;
  flushing = true;
  for (let i = 0; i < queue.length; i++) {
    queue[i]();
    lastFlushedIndex = i;
  }
  queue.length = 0;
  lastFlushedIndex = -1;
  flushing = false;
}

// packages/alpinejs/src/reactivity.js
var reactive;
var effect;
var release;
var raw;
var shouldSchedule = true;
function disableEffectScheduling(callback) {
  shouldSchedule = false;
  callback();
  shouldSchedule = true;
}
function setReactivityEngine(engine) {
  reactive = engine.reactive;
  release = engine.release;
  effect = (callback) => engine.effect(callback, { scheduler: (task) => {
    if (shouldSchedule) {
      scheduler(task);
    } else {
      task();
    }
  } });
  raw = engine.raw;
}
function overrideEffect(override) {
  effect = override;
}
function elementBoundEffect(el) {
  let cleanup2 = () => {
  };
  let wrappedEffect = (callback) => {
    let effectReference = effect(callback);
    if (!el._x_effects) {
      el._x_effects = /* @__PURE__ */ new Set();
      el._x_runEffects = () => {
        el._x_effects.forEach((i) => i());
      };
    }
    el._x_effects.add(effectReference);
    cleanup2 = () => {
      if (effectReference === void 0)
        return;
      el._x_effects.delete(effectReference);
      release(effectReference);
    };
    return effectReference;
  };
  return [wrappedEffect, () => {
    cleanup2();
  }];
}

// packages/alpinejs/src/utils/dispatch.js
function dispatch(el, name, detail = {}) {
  el.dispatchEvent(
    new CustomEvent(name, {
      detail,
      bubbles: true,
      // Allows events to pass the shadow DOM barrier.
      composed: true,
      cancelable: true
    })
  );
}

// packages/alpinejs/src/utils/walk.js
function walk(el, callback) {
  if (typeof ShadowRoot === "function" && el instanceof ShadowRoot) {
    Array.from(el.children).forEach((el2) => walk(el2, callback));
    return;
  }
  let skip = false;
  callback(el, () => skip = true);
  if (skip)
    return;
  let node = el.firstElementChild;
  while (node) {
    walk(node, callback, false);
    node = node.nextElementSibling;
  }
}

// packages/alpinejs/src/utils/warn.js
function warn(message, ...args) {
  console.warn(`Alpine Warning: ${message}`, ...args);
}

// packages/alpinejs/src/lifecycle.js
var started = false;
function start() {
  if (started)
    warn("Alpine has already been initialized on this page. Calling Alpine.start() more than once can cause problems.");
  started = true;
  if (!document.body)
    warn("Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?");
  dispatch(document, "alpine:init");
  dispatch(document, "alpine:initializing");
  startObservingMutations();
  onElAdded((el) => initTree(el, walk));
  onElRemoved((el) => destroyTree(el));
  onAttributesAdded((el, attrs) => {
    directives(el, attrs).forEach((handle) => handle());
  });
  let outNestedComponents = (el) => !closestRoot(el.parentElement, true);
  Array.from(document.querySelectorAll(allSelectors())).filter(outNestedComponents).forEach((el) => {
    initTree(el);
  });
  dispatch(document, "alpine:initialized");
}
var rootSelectorCallbacks = [];
var initSelectorCallbacks = [];
function rootSelectors() {
  return rootSelectorCallbacks.map((fn) => fn());
}
function allSelectors() {
  return rootSelectorCallbacks.concat(initSelectorCallbacks).map((fn) => fn());
}
function addRootSelector(selectorCallback) {
  rootSelectorCallbacks.push(selectorCallback);
}
function addInitSelector(selectorCallback) {
  initSelectorCallbacks.push(selectorCallback);
}
function closestRoot(el, includeInitSelectors = false) {
  return findClosest(el, (element) => {
    const selectors = includeInitSelectors ? allSelectors() : rootSelectors();
    if (selectors.some((selector) => element.matches(selector)))
      return true;
  });
}
function findClosest(el, callback) {
  if (!el)
    return;
  if (callback(el))
    return el;
  if (el._x_teleportBack)
    el = el._x_teleportBack;
  if (!el.parentElement)
    return;
  return findClosest(el.parentElement, callback);
}
function isRoot(el) {
  return rootSelectors().some((selector) => el.matches(selector));
}
var initInterceptors = [];
function interceptInit(callback) {
  initInterceptors.push(callback);
}
function initTree(el, walker = walk, intercept = () => {
}) {
  deferHandlingDirectives(() => {
    walker(el, (el2, skip) => {
      intercept(el2, skip);
      initInterceptors.forEach((i) => i(el2, skip));
      directives(el2, el2.attributes).forEach((handle) => handle());
      el2._x_ignore && skip();
    });
  });
}
function destroyTree(root) {
  walk(root, (el) => {
    cleanupAttributes(el);
    cleanupElement(el);
  });
}

// packages/alpinejs/src/mutation.js
var onAttributeAddeds = [];
var onElRemoveds = [];
var onElAddeds = [];
function onElAdded(callback) {
  onElAddeds.push(callback);
}
function onElRemoved(el, callback) {
  if (typeof callback === "function") {
    if (!el._x_cleanups)
      el._x_cleanups = [];
    el._x_cleanups.push(callback);
  } else {
    callback = el;
    onElRemoveds.push(callback);
  }
}
function onAttributesAdded(callback) {
  onAttributeAddeds.push(callback);
}
function onAttributeRemoved(el, name, callback) {
  if (!el._x_attributeCleanups)
    el._x_attributeCleanups = {};
  if (!el._x_attributeCleanups[name])
    el._x_attributeCleanups[name] = [];
  el._x_attributeCleanups[name].push(callback);
}
function cleanupAttributes(el, names) {
  if (!el._x_attributeCleanups)
    return;
  Object.entries(el._x_attributeCleanups).forEach(([name, value]) => {
    if (names === void 0 || names.includes(name)) {
      value.forEach((i) => i());
      delete el._x_attributeCleanups[name];
    }
  });
}
function cleanupElement(el) {
  if (el._x_cleanups) {
    while (el._x_cleanups.length)
      el._x_cleanups.pop()();
  }
}
var observer = new MutationObserver(onMutate);
var currentlyObserving = false;
function startObservingMutations() {
  observer.observe(document, { subtree: true, childList: true, attributes: true, attributeOldValue: true });
  currentlyObserving = true;
}
function stopObservingMutations() {
  flushObserver();
  observer.disconnect();
  currentlyObserving = false;
}
var recordQueue = [];
var willProcessRecordQueue = false;
function flushObserver() {
  recordQueue = recordQueue.concat(observer.takeRecords());
  if (recordQueue.length && !willProcessRecordQueue) {
    willProcessRecordQueue = true;
    queueMicrotask(() => {
      processRecordQueue();
      willProcessRecordQueue = false;
    });
  }
}
function processRecordQueue() {
  onMutate(recordQueue);
  recordQueue.length = 0;
}
function mutateDom(callback) {
  if (!currentlyObserving)
    return callback();
  stopObservingMutations();
  let result = callback();
  startObservingMutations();
  return result;
}
var isCollecting = false;
var deferredMutations = [];
function deferMutations() {
  isCollecting = true;
}
function flushAndStopDeferringMutations() {
  isCollecting = false;
  onMutate(deferredMutations);
  deferredMutations = [];
}
function onMutate(mutations) {
  if (isCollecting) {
    deferredMutations = deferredMutations.concat(mutations);
    return;
  }
  let addedNodes = [];
  let removedNodes = [];
  let addedAttributes = /* @__PURE__ */ new Map();
  let removedAttributes = /* @__PURE__ */ new Map();
  for (let i = 0; i < mutations.length; i++) {
    if (mutations[i].target._x_ignoreMutationObserver)
      continue;
    if (mutations[i].type === "childList") {
      mutations[i].addedNodes.forEach((node) => node.nodeType === 1 && addedNodes.push(node));
      mutations[i].removedNodes.forEach((node) => node.nodeType === 1 && removedNodes.push(node));
    }
    if (mutations[i].type === "attributes") {
      let el = mutations[i].target;
      let name = mutations[i].attributeName;
      let oldValue = mutations[i].oldValue;
      let add2 = () => {
        if (!addedAttributes.has(el))
          addedAttributes.set(el, []);
        addedAttributes.get(el).push({ name, value: el.getAttribute(name) });
      };
      let remove = () => {
        if (!removedAttributes.has(el))
          removedAttributes.set(el, []);
        removedAttributes.get(el).push(name);
      };
      if (el.hasAttribute(name) && oldValue === null) {
        add2();
      } else if (el.hasAttribute(name)) {
        remove();
        add2();
      } else {
        remove();
      }
    }
  }
  removedAttributes.forEach((attrs, el) => {
    cleanupAttributes(el, attrs);
  });
  addedAttributes.forEach((attrs, el) => {
    onAttributeAddeds.forEach((i) => i(el, attrs));
  });
  for (let node of removedNodes) {
    if (addedNodes.includes(node))
      continue;
    onElRemoveds.forEach((i) => i(node));
    destroyTree(node);
  }
  addedNodes.forEach((node) => {
    node._x_ignoreSelf = true;
    node._x_ignore = true;
  });
  for (let node of addedNodes) {
    if (removedNodes.includes(node))
      continue;
    if (!node.isConnected)
      continue;
    delete node._x_ignoreSelf;
    delete node._x_ignore;
    onElAddeds.forEach((i) => i(node));
    node._x_ignore = true;
    node._x_ignoreSelf = true;
  }
  addedNodes.forEach((node) => {
    delete node._x_ignoreSelf;
    delete node._x_ignore;
  });
  addedNodes = null;
  removedNodes = null;
  addedAttributes = null;
  removedAttributes = null;
}

// packages/alpinejs/src/scope.js
function scope(node) {
  return mergeProxies(closestDataStack(node));
}
function addScopeToNode(node, data2, referenceNode) {
  node._x_dataStack = [data2, ...closestDataStack(referenceNode || node)];
  return () => {
    node._x_dataStack = node._x_dataStack.filter((i) => i !== data2);
  };
}
function closestDataStack(node) {
  if (node._x_dataStack)
    return node._x_dataStack;
  if (typeof ShadowRoot === "function" && node instanceof ShadowRoot) {
    return closestDataStack(node.host);
  }
  if (!node.parentNode) {
    return [];
  }
  return closestDataStack(node.parentNode);
}
function mergeProxies(objects) {
  return new Proxy({ objects }, mergeProxyTrap);
}
var mergeProxyTrap = {
  ownKeys({ objects }) {
    return Array.from(
      new Set(objects.flatMap((i) => Object.keys(i)))
    );
  },
  has({ objects }, name) {
    if (name == Symbol.unscopables)
      return false;
    return objects.some(
      (obj) => Object.prototype.hasOwnProperty.call(obj, name)
    );
  },
  get({ objects }, name, thisProxy) {
    if (name == "toJSON")
      return collapseProxies;
    return Reflect.get(
      objects.find(
        (obj) => Object.prototype.hasOwnProperty.call(obj, name)
      ) || {},
      name,
      thisProxy
    );
  },
  set({ objects }, name, value, thisProxy) {
    const target = objects.find(
      (obj) => Object.prototype.hasOwnProperty.call(obj, name)
    ) || objects[objects.length - 1];
    const descriptor = Object.getOwnPropertyDescriptor(target, name);
    if (descriptor?.set && descriptor?.get)
      return Reflect.set(target, name, value, thisProxy);
    return Reflect.set(target, name, value);
  }
};
function collapseProxies() {
  let keys = Reflect.ownKeys(this);
  return keys.reduce((acc, key) => {
    acc[key] = Reflect.get(this, key);
    return acc;
  }, {});
}

// packages/alpinejs/src/interceptor.js
function initInterceptors2(data2) {
  let isObject2 = (val) => typeof val === "object" && !Array.isArray(val) && val !== null;
  let recurse = (obj, basePath = "") => {
    Object.entries(Object.getOwnPropertyDescriptors(obj)).forEach(([key, { value, enumerable }]) => {
      if (enumerable === false || value === void 0)
        return;
      let path = basePath === "" ? key : `${basePath}.${key}`;
      if (typeof value === "object" && value !== null && value._x_interceptor) {
        obj[key] = value.initialize(data2, path, key);
      } else {
        if (isObject2(value) && value !== obj && !(value instanceof Element)) {
          recurse(value, path);
        }
      }
    });
  };
  return recurse(data2);
}
function interceptor(callback, mutateObj = () => {
}) {
  let obj = {
    initialValue: void 0,
    _x_interceptor: true,
    initialize(data2, path, key) {
      return callback(this.initialValue, () => get(data2, path), (value) => set(data2, path, value), path, key);
    }
  };
  mutateObj(obj);
  return (initialValue) => {
    if (typeof initialValue === "object" && initialValue !== null && initialValue._x_interceptor) {
      let initialize = obj.initialize.bind(obj);
      obj.initialize = (data2, path, key) => {
        let innerValue = initialValue.initialize(data2, path, key);
        obj.initialValue = innerValue;
        return initialize(data2, path, key);
      };
    } else {
      obj.initialValue = initialValue;
    }
    return obj;
  };
}
function get(obj, path) {
  return path.split(".").reduce((carry, segment) => carry[segment], obj);
}
function set(obj, path, value) {
  if (typeof path === "string")
    path = path.split(".");
  if (path.length === 1)
    obj[path[0]] = value;
  else if (path.length === 0)
    throw error;
  else {
    if (obj[path[0]])
      return set(obj[path[0]], path.slice(1), value);
    else {
      obj[path[0]] = {};
      return set(obj[path[0]], path.slice(1), value);
    }
  }
}

// packages/alpinejs/src/magics.js
var magics = {};
function magic(name, callback) {
  magics[name] = callback;
}
function injectMagics(obj, el) {
  Object.entries(magics).forEach(([name, callback]) => {
    let memoizedUtilities = null;
    function getUtilities() {
      if (memoizedUtilities) {
        return memoizedUtilities;
      } else {
        let [utilities, cleanup2] = getElementBoundUtilities(el);
        memoizedUtilities = { interceptor, ...utilities };
        onElRemoved(el, cleanup2);
        return memoizedUtilities;
      }
    }
    Object.defineProperty(obj, `$${name}`, {
      get() {
        return callback(el, getUtilities());
      },
      enumerable: false
    });
  });
  return obj;
}

// packages/alpinejs/src/utils/error.js
function tryCatch(el, expression, callback, ...args) {
  try {
    return callback(...args);
  } catch (e) {
    handleError(e, el, expression);
  }
}
function handleError(error2, el, expression = void 0) {
  Object.assign(error2, { el, expression });
  console.warn(`Alpine Expression Error: ${error2.message}

${expression ? 'Expression: "' + expression + '"\n\n' : ""}`, el);
  setTimeout(() => {
    throw error2;
  }, 0);
}

// packages/alpinejs/src/evaluator.js
var shouldAutoEvaluateFunctions = true;
function dontAutoEvaluateFunctions(callback) {
  let cache = shouldAutoEvaluateFunctions;
  shouldAutoEvaluateFunctions = false;
  let result = callback();
  shouldAutoEvaluateFunctions = cache;
  return result;
}
function evaluate(el, expression, extras = {}) {
  let result;
  evaluateLater(el, expression)((value) => result = value, extras);
  return result;
}
function evaluateLater(...args) {
  return theEvaluatorFunction(...args);
}
var theEvaluatorFunction = normalEvaluator;
function setEvaluator(newEvaluator) {
  theEvaluatorFunction = newEvaluator;
}
function normalEvaluator(el, expression) {
  let overriddenMagics = {};
  injectMagics(overriddenMagics, el);
  let dataStack = [overriddenMagics, ...closestDataStack(el)];
  let evaluator = typeof expression === "function" ? generateEvaluatorFromFunction(dataStack, expression) : generateEvaluatorFromString(dataStack, expression, el);
  return tryCatch.bind(null, el, expression, evaluator);
}
function generateEvaluatorFromFunction(dataStack, func) {
  return (receiver = () => {
  }, { scope: scope2 = {}, params = [] } = {}) => {
    let result = func.apply(mergeProxies([scope2, ...dataStack]), params);
    runIfTypeOfFunction(receiver, result);
  };
}
var evaluatorMemo = {};
function generateFunctionFromString(expression, el) {
  if (evaluatorMemo[expression]) {
    return evaluatorMemo[expression];
  }
  let AsyncFunction = Object.getPrototypeOf(async function() {
  }).constructor;
  let rightSideSafeExpression = /^[\n\s]*if.*\(.*\)/.test(expression.trim()) || /^(let|const)\s/.test(expression.trim()) ? `(async()=>{ ${expression} })()` : expression;
  const safeAsyncFunction = () => {
    try {
      let func2 = new AsyncFunction(
        ["__self", "scope"],
        `with (scope) { __self.result = ${rightSideSafeExpression} }; __self.finished = true; return __self.result;`
      );
      Object.defineProperty(func2, "name", {
        value: `[Alpine] ${expression}`
      });
      return func2;
    } catch (error2) {
      handleError(error2, el, expression);
      return Promise.resolve();
    }
  };
  let func = safeAsyncFunction();
  evaluatorMemo[expression] = func;
  return func;
}
function generateEvaluatorFromString(dataStack, expression, el) {
  let func = generateFunctionFromString(expression, el);
  return (receiver = () => {
  }, { scope: scope2 = {}, params = [] } = {}) => {
    func.result = void 0;
    func.finished = false;
    let completeScope = mergeProxies([scope2, ...dataStack]);
    if (typeof func === "function") {
      let promise = func(func, completeScope).catch((error2) => handleError(error2, el, expression));
      if (func.finished) {
        runIfTypeOfFunction(receiver, func.result, completeScope, params, el);
        func.result = void 0;
      } else {
        promise.then((result) => {
          runIfTypeOfFunction(receiver, result, completeScope, params, el);
        }).catch((error2) => handleError(error2, el, expression)).finally(() => func.result = void 0);
      }
    }
  };
}
function runIfTypeOfFunction(receiver, value, scope2, params, el) {
  if (shouldAutoEvaluateFunctions && typeof value === "function") {
    let result = value.apply(scope2, params);
    if (result instanceof Promise) {
      result.then((i) => runIfTypeOfFunction(receiver, i, scope2, params)).catch((error2) => handleError(error2, el, value));
    } else {
      receiver(result);
    }
  } else if (typeof value === "object" && value instanceof Promise) {
    value.then((i) => receiver(i));
  } else {
    receiver(value);
  }
}

// packages/alpinejs/src/directives.js
var prefixAsString = "x-";
function prefix(subject = "") {
  return prefixAsString + subject;
}
function setPrefix(newPrefix) {
  prefixAsString = newPrefix;
}
var directiveHandlers = {};
function directive(name, callback) {
  directiveHandlers[name] = callback;
  return {
    before(directive2) {
      if (!directiveHandlers[directive2]) {
        console.warn(
          "Cannot find directive `${directive}`. `${name}` will use the default order of execution"
        );
        return;
      }
      const pos = directiveOrder.indexOf(directive2);
      directiveOrder.splice(pos >= 0 ? pos : directiveOrder.indexOf("DEFAULT"), 0, name);
    }
  };
}
function directives(el, attributes, originalAttributeOverride) {
  attributes = Array.from(attributes);
  if (el._x_virtualDirectives) {
    let vAttributes = Object.entries(el._x_virtualDirectives).map(([name, value]) => ({ name, value }));
    let staticAttributes = attributesOnly(vAttributes);
    vAttributes = vAttributes.map((attribute) => {
      if (staticAttributes.find((attr) => attr.name === attribute.name)) {
        return {
          name: `x-bind:${attribute.name}`,
          value: `"${attribute.value}"`
        };
      }
      return attribute;
    });
    attributes = attributes.concat(vAttributes);
  }
  let transformedAttributeMap = {};
  let directives2 = attributes.map(toTransformedAttributes((newName, oldName) => transformedAttributeMap[newName] = oldName)).filter(outNonAlpineAttributes).map(toParsedDirectives(transformedAttributeMap, originalAttributeOverride)).sort(byPriority);
  return directives2.map((directive2) => {
    return getDirectiveHandler(el, directive2);
  });
}
function attributesOnly(attributes) {
  return Array.from(attributes).map(toTransformedAttributes()).filter((attr) => !outNonAlpineAttributes(attr));
}
var isDeferringHandlers = false;
var directiveHandlerStacks = /* @__PURE__ */ new Map();
var currentHandlerStackKey = Symbol();
function deferHandlingDirectives(callback) {
  isDeferringHandlers = true;
  let key = Symbol();
  currentHandlerStackKey = key;
  directiveHandlerStacks.set(key, []);
  let flushHandlers = () => {
    while (directiveHandlerStacks.get(key).length)
      directiveHandlerStacks.get(key).shift()();
    directiveHandlerStacks.delete(key);
  };
  let stopDeferring = () => {
    isDeferringHandlers = false;
    flushHandlers();
  };
  callback(flushHandlers);
  stopDeferring();
}
function getElementBoundUtilities(el) {
  let cleanups = [];
  let cleanup2 = (callback) => cleanups.push(callback);
  let [effect3, cleanupEffect] = elementBoundEffect(el);
  cleanups.push(cleanupEffect);
  let utilities = {
    Alpine: alpine_default,
    effect: effect3,
    cleanup: cleanup2,
    evaluateLater: evaluateLater.bind(evaluateLater, el),
    evaluate: evaluate.bind(evaluate, el)
  };
  let doCleanup = () => cleanups.forEach((i) => i());
  return [utilities, doCleanup];
}
function getDirectiveHandler(el, directive2) {
  let noop = () => {
  };
  let handler4 = directiveHandlers[directive2.type] || noop;
  let [utilities, cleanup2] = getElementBoundUtilities(el);
  onAttributeRemoved(el, directive2.original, cleanup2);
  let fullHandler = () => {
    if (el._x_ignore || el._x_ignoreSelf)
      return;
    handler4.inline && handler4.inline(el, directive2, utilities);
    handler4 = handler4.bind(handler4, el, directive2, utilities);
    isDeferringHandlers ? directiveHandlerStacks.get(currentHandlerStackKey).push(handler4) : handler4();
  };
  fullHandler.runCleanups = cleanup2;
  return fullHandler;
}
var startingWith = (subject, replacement) => ({ name, value }) => {
  if (name.startsWith(subject))
    name = name.replace(subject, replacement);
  return { name, value };
};
var into = (i) => i;
function toTransformedAttributes(callback = () => {
}) {
  return ({ name, value }) => {
    let { name: newName, value: newValue } = attributeTransformers.reduce((carry, transform) => {
      return transform(carry);
    }, { name, value });
    if (newName !== name)
      callback(newName, name);
    return { name: newName, value: newValue };
  };
}
var attributeTransformers = [];
function mapAttributes(callback) {
  attributeTransformers.push(callback);
}
function outNonAlpineAttributes({ name }) {
  return alpineAttributeRegex().test(name);
}
var alpineAttributeRegex = () => new RegExp(`^${prefixAsString}([^:^.]+)\\b`);
function toParsedDirectives(transformedAttributeMap, originalAttributeOverride) {
  return ({ name, value }) => {
    let typeMatch = name.match(alpineAttributeRegex());
    let valueMatch = name.match(/:([a-zA-Z0-9\-_:]+)/);
    let modifiers = name.match(/\.[^.\]]+(?=[^\]]*$)/g) || [];
    let original = originalAttributeOverride || transformedAttributeMap[name] || name;
    return {
      type: typeMatch ? typeMatch[1] : null,
      value: valueMatch ? valueMatch[1] : null,
      modifiers: modifiers.map((i) => i.replace(".", "")),
      expression: value,
      original
    };
  };
}
var DEFAULT = "DEFAULT";
var directiveOrder = [
  "ignore",
  "ref",
  "data",
  "id",
  "bind",
  "init",
  "for",
  "model",
  "modelable",
  "transition",
  "show",
  "if",
  DEFAULT,
  "teleport"
];
function byPriority(a, b) {
  let typeA = directiveOrder.indexOf(a.type) === -1 ? DEFAULT : a.type;
  let typeB = directiveOrder.indexOf(b.type) === -1 ? DEFAULT : b.type;
  return directiveOrder.indexOf(typeA) - directiveOrder.indexOf(typeB);
}

// packages/alpinejs/src/nextTick.js
var tickStack = [];
var isHolding = false;
function nextTick(callback = () => {
}) {
  queueMicrotask(() => {
    isHolding || setTimeout(() => {
      releaseNextTicks();
    });
  });
  return new Promise((res) => {
    tickStack.push(() => {
      callback();
      res();
    });
  });
}
function releaseNextTicks() {
  isHolding = false;
  while (tickStack.length)
    tickStack.shift()();
}
function holdNextTicks() {
  isHolding = true;
}

// packages/alpinejs/src/utils/classes.js
function setClasses(el, value) {
  if (Array.isArray(value)) {
    return setClassesFromString(el, value.join(" "));
  } else if (typeof value === "object" && value !== null) {
    return setClassesFromObject(el, value);
  } else if (typeof value === "function") {
    return setClasses(el, value());
  }
  return setClassesFromString(el, value);
}
function setClassesFromString(el, classString) {
  let split = (classString2) => classString2.split(" ").filter(Boolean);
  let missingClasses = (classString2) => classString2.split(" ").filter((i) => !el.classList.contains(i)).filter(Boolean);
  let addClassesAndReturnUndo = (classes) => {
    el.classList.add(...classes);
    return () => {
      el.classList.remove(...classes);
    };
  };
  classString = classString === true ? classString = "" : classString || "";
  return addClassesAndReturnUndo(missingClasses(classString));
}
function setClassesFromObject(el, classObject) {
  let split = (classString) => classString.split(" ").filter(Boolean);
  let forAdd = Object.entries(classObject).flatMap(([classString, bool]) => bool ? split(classString) : false).filter(Boolean);
  let forRemove = Object.entries(classObject).flatMap(([classString, bool]) => !bool ? split(classString) : false).filter(Boolean);
  let added = [];
  let removed = [];
  forRemove.forEach((i) => {
    if (el.classList.contains(i)) {
      el.classList.remove(i);
      removed.push(i);
    }
  });
  forAdd.forEach((i) => {
    if (!el.classList.contains(i)) {
      el.classList.add(i);
      added.push(i);
    }
  });
  return () => {
    removed.forEach((i) => el.classList.add(i));
    added.forEach((i) => el.classList.remove(i));
  };
}

// packages/alpinejs/src/utils/styles.js
function setStyles(el, value) {
  if (typeof value === "object" && value !== null) {
    return setStylesFromObject(el, value);
  }
  return setStylesFromString(el, value);
}
function setStylesFromObject(el, value) {
  let previousStyles = {};
  Object.entries(value).forEach(([key, value2]) => {
    previousStyles[key] = el.style[key];
    if (!key.startsWith("--")) {
      key = kebabCase(key);
    }
    el.style.setProperty(key, value2);
  });
  setTimeout(() => {
    if (el.style.length === 0) {
      el.removeAttribute("style");
    }
  });
  return () => {
    setStyles(el, previousStyles);
  };
}
function setStylesFromString(el, value) {
  let cache = el.getAttribute("style", value);
  el.setAttribute("style", value);
  return () => {
    el.setAttribute("style", cache || "");
  };
}
function kebabCase(subject) {
  return subject.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// packages/alpinejs/src/utils/once.js
function once(callback, fallback = () => {
}) {
  let called = false;
  return function() {
    if (!called) {
      called = true;
      callback.apply(this, arguments);
    } else {
      fallback.apply(this, arguments);
    }
  };
}

// packages/alpinejs/src/directives/x-transition.js
directive("transition", (el, { value, modifiers, expression }, { evaluate: evaluate2 }) => {
  if (typeof expression === "function")
    expression = evaluate2(expression);
  if (expression === false)
    return;
  if (!expression || typeof expression === "boolean") {
    registerTransitionsFromHelper(el, modifiers, value);
  } else {
    registerTransitionsFromClassString(el, expression, value);
  }
});
function registerTransitionsFromClassString(el, classString, stage) {
  registerTransitionObject(el, setClasses, "");
  let directiveStorageMap = {
    "enter": (classes) => {
      el._x_transition.enter.during = classes;
    },
    "enter-start": (classes) => {
      el._x_transition.enter.start = classes;
    },
    "enter-end": (classes) => {
      el._x_transition.enter.end = classes;
    },
    "leave": (classes) => {
      el._x_transition.leave.during = classes;
    },
    "leave-start": (classes) => {
      el._x_transition.leave.start = classes;
    },
    "leave-end": (classes) => {
      el._x_transition.leave.end = classes;
    }
  };
  directiveStorageMap[stage](classString);
}
function registerTransitionsFromHelper(el, modifiers, stage) {
  registerTransitionObject(el, setStyles);
  let doesntSpecify = !modifiers.includes("in") && !modifiers.includes("out") && !stage;
  let transitioningIn = doesntSpecify || modifiers.includes("in") || ["enter"].includes(stage);
  let transitioningOut = doesntSpecify || modifiers.includes("out") || ["leave"].includes(stage);
  if (modifiers.includes("in") && !doesntSpecify) {
    modifiers = modifiers.filter((i, index) => index < modifiers.indexOf("out"));
  }
  if (modifiers.includes("out") && !doesntSpecify) {
    modifiers = modifiers.filter((i, index) => index > modifiers.indexOf("out"));
  }
  let wantsAll = !modifiers.includes("opacity") && !modifiers.includes("scale");
  let wantsOpacity = wantsAll || modifiers.includes("opacity");
  let wantsScale = wantsAll || modifiers.includes("scale");
  let opacityValue = wantsOpacity ? 0 : 1;
  let scaleValue = wantsScale ? modifierValue(modifiers, "scale", 95) / 100 : 1;
  let delay = modifierValue(modifiers, "delay", 0) / 1e3;
  let origin = modifierValue(modifiers, "origin", "center");
  let property = "opacity, transform";
  let durationIn = modifierValue(modifiers, "duration", 150) / 1e3;
  let durationOut = modifierValue(modifiers, "duration", 75) / 1e3;
  let easing = `cubic-bezier(0.4, 0.0, 0.2, 1)`;
  if (transitioningIn) {
    el._x_transition.enter.during = {
      transformOrigin: origin,
      transitionDelay: `${delay}s`,
      transitionProperty: property,
      transitionDuration: `${durationIn}s`,
      transitionTimingFunction: easing
    };
    el._x_transition.enter.start = {
      opacity: opacityValue,
      transform: `scale(${scaleValue})`
    };
    el._x_transition.enter.end = {
      opacity: 1,
      transform: `scale(1)`
    };
  }
  if (transitioningOut) {
    el._x_transition.leave.during = {
      transformOrigin: origin,
      transitionDelay: `${delay}s`,
      transitionProperty: property,
      transitionDuration: `${durationOut}s`,
      transitionTimingFunction: easing
    };
    el._x_transition.leave.start = {
      opacity: 1,
      transform: `scale(1)`
    };
    el._x_transition.leave.end = {
      opacity: opacityValue,
      transform: `scale(${scaleValue})`
    };
  }
}
function registerTransitionObject(el, setFunction, defaultValue = {}) {
  if (!el._x_transition)
    el._x_transition = {
      enter: { during: defaultValue, start: defaultValue, end: defaultValue },
      leave: { during: defaultValue, start: defaultValue, end: defaultValue },
      in(before = () => {
      }, after = () => {
      }) {
        transition(el, setFunction, {
          during: this.enter.during,
          start: this.enter.start,
          end: this.enter.end
        }, before, after);
      },
      out(before = () => {
      }, after = () => {
      }) {
        transition(el, setFunction, {
          during: this.leave.during,
          start: this.leave.start,
          end: this.leave.end
        }, before, after);
      }
    };
}
window.Element.prototype._x_toggleAndCascadeWithTransitions = function(el, value, show, hide) {
  const nextTick2 = document.visibilityState === "visible" ? requestAnimationFrame : setTimeout;
  let clickAwayCompatibleShow = () => nextTick2(show);
  if (value) {
    if (el._x_transition && (el._x_transition.enter || el._x_transition.leave)) {
      el._x_transition.enter && (Object.entries(el._x_transition.enter.during).length || Object.entries(el._x_transition.enter.start).length || Object.entries(el._x_transition.enter.end).length) ? el._x_transition.in(show) : clickAwayCompatibleShow();
    } else {
      el._x_transition ? el._x_transition.in(show) : clickAwayCompatibleShow();
    }
    return;
  }
  el._x_hidePromise = el._x_transition ? new Promise((resolve, reject) => {
    el._x_transition.out(() => {
    }, () => resolve(hide));
    el._x_transitioning.beforeCancel(() => reject({ isFromCancelledTransition: true }));
  }) : Promise.resolve(hide);
  queueMicrotask(() => {
    let closest = closestHide(el);
    if (closest) {
      if (!closest._x_hideChildren)
        closest._x_hideChildren = [];
      closest._x_hideChildren.push(el);
    } else {
      nextTick2(() => {
        let hideAfterChildren = (el2) => {
          let carry = Promise.all([
            el2._x_hidePromise,
            ...(el2._x_hideChildren || []).map(hideAfterChildren)
          ]).then(([i]) => i());
          delete el2._x_hidePromise;
          delete el2._x_hideChildren;
          return carry;
        };
        hideAfterChildren(el).catch((e) => {
          if (!e.isFromCancelledTransition)
            throw e;
        });
      });
    }
  });
};
function closestHide(el) {
  let parent = el.parentNode;
  if (!parent)
    return;
  return parent._x_hidePromise ? parent : closestHide(parent);
}
function transition(el, setFunction, { during, start: start2, end } = {}, before = () => {
}, after = () => {
}) {
  if (el._x_transitioning)
    el._x_transitioning.cancel();
  if (Object.keys(during).length === 0 && Object.keys(start2).length === 0 && Object.keys(end).length === 0) {
    before();
    after();
    return;
  }
  let undoStart, undoDuring, undoEnd;
  performTransition(el, {
    start() {
      undoStart = setFunction(el, start2);
    },
    during() {
      undoDuring = setFunction(el, during);
    },
    before,
    end() {
      undoStart();
      undoEnd = setFunction(el, end);
    },
    after,
    cleanup() {
      undoDuring();
      undoEnd();
    }
  });
}
function performTransition(el, stages) {
  let interrupted, reachedBefore, reachedEnd;
  let finish = once(() => {
    mutateDom(() => {
      interrupted = true;
      if (!reachedBefore)
        stages.before();
      if (!reachedEnd) {
        stages.end();
        releaseNextTicks();
      }
      stages.after();
      if (el.isConnected)
        stages.cleanup();
      delete el._x_transitioning;
    });
  });
  el._x_transitioning = {
    beforeCancels: [],
    beforeCancel(callback) {
      this.beforeCancels.push(callback);
    },
    cancel: once(function() {
      while (this.beforeCancels.length) {
        this.beforeCancels.shift()();
      }
      ;
      finish();
    }),
    finish
  };
  mutateDom(() => {
    stages.start();
    stages.during();
  });
  holdNextTicks();
  requestAnimationFrame(() => {
    if (interrupted)
      return;
    let duration = Number(getComputedStyle(el).transitionDuration.replace(/,.*/, "").replace("s", "")) * 1e3;
    let delay = Number(getComputedStyle(el).transitionDelay.replace(/,.*/, "").replace("s", "")) * 1e3;
    if (duration === 0)
      duration = Number(getComputedStyle(el).animationDuration.replace("s", "")) * 1e3;
    mutateDom(() => {
      stages.before();
    });
    reachedBefore = true;
    requestAnimationFrame(() => {
      if (interrupted)
        return;
      mutateDom(() => {
        stages.end();
      });
      releaseNextTicks();
      setTimeout(el._x_transitioning.finish, duration + delay);
      reachedEnd = true;
    });
  });
}
function modifierValue(modifiers, key, fallback) {
  if (modifiers.indexOf(key) === -1)
    return fallback;
  const rawValue = modifiers[modifiers.indexOf(key) + 1];
  if (!rawValue)
    return fallback;
  if (key === "scale") {
    if (isNaN(rawValue))
      return fallback;
  }
  if (key === "duration" || key === "delay") {
    let match = rawValue.match(/([0-9]+)ms/);
    if (match)
      return match[1];
  }
  if (key === "origin") {
    if (["top", "right", "left", "center", "bottom"].includes(modifiers[modifiers.indexOf(key) + 2])) {
      return [rawValue, modifiers[modifiers.indexOf(key) + 2]].join(" ");
    }
  }
  return rawValue;
}

// packages/alpinejs/src/clone.js
var isCloning = false;
function skipDuringClone(callback, fallback = () => {
}) {
  return (...args) => isCloning ? fallback(...args) : callback(...args);
}
function onlyDuringClone(callback) {
  return (...args) => isCloning && callback(...args);
}
function cloneNode(from, to) {
  if (from._x_dataStack) {
    to._x_dataStack = from._x_dataStack;
    to.setAttribute("data-has-alpine-state", true);
  }
  isCloning = true;
  dontRegisterReactiveSideEffects(() => {
    initTree(to, (el, callback) => {
      callback(el, () => {
      });
    });
  });
  isCloning = false;
}
var isCloningLegacy = false;
function clone(oldEl, newEl) {
  if (!newEl._x_dataStack)
    newEl._x_dataStack = oldEl._x_dataStack;
  isCloning = true;
  isCloningLegacy = true;
  dontRegisterReactiveSideEffects(() => {
    cloneTree(newEl);
  });
  isCloning = false;
  isCloningLegacy = false;
}
function cloneTree(el) {
  let hasRunThroughFirstEl = false;
  let shallowWalker = (el2, callback) => {
    walk(el2, (el3, skip) => {
      if (hasRunThroughFirstEl && isRoot(el3))
        return skip();
      hasRunThroughFirstEl = true;
      callback(el3, skip);
    });
  };
  initTree(el, shallowWalker);
}
function dontRegisterReactiveSideEffects(callback) {
  let cache = effect;
  overrideEffect((callback2, el) => {
    let storedEffect = cache(callback2);
    release(storedEffect);
    return () => {
    };
  });
  callback();
  overrideEffect(cache);
}
function shouldSkipRegisteringDataDuringClone(el) {
  if (!isCloning)
    return false;
  if (isCloningLegacy)
    return true;
  return el.hasAttribute("data-has-alpine-state");
}

// packages/alpinejs/src/utils/bind.js
function bind(el, name, value, modifiers = []) {
  if (!el._x_bindings)
    el._x_bindings = reactive({});
  el._x_bindings[name] = value;
  name = modifiers.includes("camel") ? camelCase(name) : name;
  switch (name) {
    case "value":
      bindInputValue(el, value);
      break;
    case "style":
      bindStyles(el, value);
      break;
    case "class":
      bindClasses(el, value);
      break;
    case "selected":
    case "checked":
      bindAttributeAndProperty(el, name, value);
      break;
    default:
      bindAttribute(el, name, value);
      break;
  }
}
function bindInputValue(el, value) {
  if (el.type === "radio") {
    if (el.attributes.value === void 0) {
      el.value = value;
    }
    if (window.fromModel) {
      el.checked = checkedAttrLooseCompare(el.value, value);
    }
  } else if (el.type === "checkbox") {
    if (Number.isInteger(value)) {
      el.value = value;
    } else if (!Array.isArray(value) && typeof value !== "boolean" && ![null, void 0].includes(value)) {
      el.value = String(value);
    } else {
      if (Array.isArray(value)) {
        el.checked = value.some((val) => checkedAttrLooseCompare(val, el.value));
      } else {
        el.checked = !!value;
      }
    }
  } else if (el.tagName === "SELECT") {
    updateSelect(el, value);
  } else {
    if (el.value === value)
      return;
    el.value = value === void 0 ? "" : value;
  }
}
function bindClasses(el, value) {
  if (el._x_undoAddedClasses)
    el._x_undoAddedClasses();
  el._x_undoAddedClasses = setClasses(el, value);
}
function bindStyles(el, value) {
  if (el._x_undoAddedStyles)
    el._x_undoAddedStyles();
  el._x_undoAddedStyles = setStyles(el, value);
}
function bindAttributeAndProperty(el, name, value) {
  bindAttribute(el, name, value);
  setPropertyIfChanged(el, name, value);
}
function bindAttribute(el, name, value) {
  if ([null, void 0, false].includes(value) && attributeShouldntBePreservedIfFalsy(name)) {
    el.removeAttribute(name);
  } else {
    if (isBooleanAttr(name))
      value = name;
    setIfChanged(el, name, value);
  }
}
function setIfChanged(el, attrName, value) {
  if (el.getAttribute(attrName) != value) {
    el.setAttribute(attrName, value);
  }
}
function setPropertyIfChanged(el, propName, value) {
  if (el[propName] !== value) {
    el[propName] = value;
  }
}
function updateSelect(el, value) {
  const arrayWrappedValue = [].concat(value).map((value2) => {
    return value2 + "";
  });
  Array.from(el.options).forEach((option) => {
    option.selected = arrayWrappedValue.includes(option.value);
  });
}
function camelCase(subject) {
  return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
}
function checkedAttrLooseCompare(valueA, valueB) {
  return valueA == valueB;
}
function isBooleanAttr(attrName) {
  const booleanAttributes = [
    "disabled",
    "checked",
    "required",
    "readonly",
    "hidden",
    "open",
    "selected",
    "autofocus",
    "itemscope",
    "multiple",
    "novalidate",
    "allowfullscreen",
    "allowpaymentrequest",
    "formnovalidate",
    "autoplay",
    "controls",
    "loop",
    "muted",
    "playsinline",
    "default",
    "ismap",
    "reversed",
    "async",
    "defer",
    "nomodule"
  ];
  return booleanAttributes.includes(attrName);
}
function attributeShouldntBePreservedIfFalsy(name) {
  return !["aria-pressed", "aria-checked", "aria-expanded", "aria-selected"].includes(name);
}
function getBinding(el, name, fallback) {
  if (el._x_bindings && el._x_bindings[name] !== void 0)
    return el._x_bindings[name];
  return getAttributeBinding(el, name, fallback);
}
function extractProp(el, name, fallback, extract = true) {
  if (el._x_bindings && el._x_bindings[name] !== void 0)
    return el._x_bindings[name];
  if (el._x_inlineBindings && el._x_inlineBindings[name] !== void 0) {
    let binding = el._x_inlineBindings[name];
    binding.extract = extract;
    return dontAutoEvaluateFunctions(() => {
      return evaluate(el, binding.expression);
    });
  }
  return getAttributeBinding(el, name, fallback);
}
function getAttributeBinding(el, name, fallback) {
  let attr = el.getAttribute(name);
  if (attr === null)
    return typeof fallback === "function" ? fallback() : fallback;
  if (attr === "")
    return true;
  if (isBooleanAttr(name)) {
    return !![name, "true"].includes(attr);
  }
  return attr;
}

// packages/alpinejs/src/utils/debounce.js
function debounce(func, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// packages/alpinejs/src/utils/throttle.js
function throttle(func, limit) {
  let inThrottle;
  return function() {
    let context = this, args = arguments;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// packages/alpinejs/src/entangle.js
function entangle({ get: outerGet, set: outerSet }, { get: innerGet, set: innerSet }) {
  let firstRun = true;
  let outerHash;
  let reference = effect(() => {
    const outer = outerGet();
    const inner = innerGet();
    if (firstRun) {
      innerSet(cloneIfObject(outer));
      firstRun = false;
      outerHash = JSON.stringify(outer);
    } else {
      const outerHashLatest = JSON.stringify(outer);
      if (outerHashLatest !== outerHash) {
        innerSet(cloneIfObject(outer));
        outerHash = outerHashLatest;
      } else {
        outerSet(cloneIfObject(inner));
        outerHash = JSON.stringify(inner);
      }
    }
    JSON.stringify(innerGet());
    JSON.stringify(outerGet());
  });
  return () => {
    release(reference);
  };
}
function cloneIfObject(value) {
  return typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
}

// packages/alpinejs/src/plugin.js
function plugin(callback) {
  let callbacks = Array.isArray(callback) ? callback : [callback];
  callbacks.forEach((i) => i(alpine_default));
}

// packages/alpinejs/src/store.js
var stores = {};
var isReactive = false;
function store(name, value) {
  if (!isReactive) {
    stores = reactive(stores);
    isReactive = true;
  }
  if (value === void 0) {
    return stores[name];
  }
  stores[name] = value;
  if (typeof value === "object" && value !== null && value.hasOwnProperty("init") && typeof value.init === "function") {
    stores[name].init();
  }
  initInterceptors2(stores[name]);
}
function getStores() {
  return stores;
}

// packages/alpinejs/src/binds.js
var binds = {};
function bind2(name, bindings) {
  let getBindings = typeof bindings !== "function" ? () => bindings : bindings;
  if (name instanceof Element) {
    return applyBindingsObject(name, getBindings());
  } else {
    binds[name] = getBindings;
  }
  return () => {
  };
}
function injectBindingProviders(obj) {
  Object.entries(binds).forEach(([name, callback]) => {
    Object.defineProperty(obj, name, {
      get() {
        return (...args) => {
          return callback(...args);
        };
      }
    });
  });
  return obj;
}
function applyBindingsObject(el, obj, original) {
  let cleanupRunners = [];
  while (cleanupRunners.length)
    cleanupRunners.pop()();
  let attributes = Object.entries(obj).map(([name, value]) => ({ name, value }));
  let staticAttributes = attributesOnly(attributes);
  attributes = attributes.map((attribute) => {
    if (staticAttributes.find((attr) => attr.name === attribute.name)) {
      return {
        name: `x-bind:${attribute.name}`,
        value: `"${attribute.value}"`
      };
    }
    return attribute;
  });
  directives(el, attributes, original).map((handle) => {
    cleanupRunners.push(handle.runCleanups);
    handle();
  });
  return () => {
    while (cleanupRunners.length)
      cleanupRunners.pop()();
  };
}

// packages/alpinejs/src/datas.js
var datas = {};
function data(name, callback) {
  datas[name] = callback;
}
function injectDataProviders(obj, context) {
  Object.entries(datas).forEach(([name, callback]) => {
    Object.defineProperty(obj, name, {
      get() {
        return (...args) => {
          return callback.bind(context)(...args);
        };
      },
      enumerable: false
    });
  });
  return obj;
}

// packages/alpinejs/src/alpine.js
var Alpine = {
  get reactive() {
    return reactive;
  },
  get release() {
    return release;
  },
  get effect() {
    return effect;
  },
  get raw() {
    return raw;
  },
  version: "3.13.2",
  flushAndStopDeferringMutations,
  dontAutoEvaluateFunctions,
  disableEffectScheduling,
  startObservingMutations,
  stopObservingMutations,
  setReactivityEngine,
  onAttributeRemoved,
  onAttributesAdded,
  closestDataStack,
  skipDuringClone,
  onlyDuringClone,
  addRootSelector,
  addInitSelector,
  addScopeToNode,
  deferMutations,
  mapAttributes,
  evaluateLater,
  interceptInit,
  setEvaluator,
  mergeProxies,
  extractProp,
  findClosest,
  onElRemoved,
  closestRoot,
  destroyTree,
  interceptor,
  // INTERNAL: not public API and is subject to change without major release.
  transition,
  // INTERNAL
  setStyles,
  // INTERNAL
  mutateDom,
  directive,
  entangle,
  throttle,
  debounce,
  evaluate,
  initTree,
  nextTick,
  prefixed: prefix,
  prefix: setPrefix,
  plugin,
  magic,
  store,
  start,
  clone,
  // INTERNAL
  cloneNode,
  // INTERNAL
  bound: getBinding,
  $data: scope,
  walk,
  data,
  bind: bind2
};
var alpine_default = Alpine;

// node_modules/@vue/shared/dist/shared.esm-bundler.js
function makeMap(str, expectsLowerCase) {
  const map = /* @__PURE__ */ Object.create(null);
  const list = str.split(",");
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
}
var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
var isBooleanAttr2 = /* @__PURE__ */ makeMap(specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`);
var EMPTY_OBJ =  true ? Object.freeze({}) : 0;
var EMPTY_ARR =  true ? Object.freeze([]) : 0;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var hasOwn = (val, key) => hasOwnProperty.call(val, key);
var isArray = Array.isArray;
var isMap = (val) => toTypeString(val) === "[object Map]";
var isString = (val) => typeof val === "string";
var isSymbol = (val) => typeof val === "symbol";
var isObject = (val) => val !== null && typeof val === "object";
var objectToString = Object.prototype.toString;
var toTypeString = (value) => objectToString.call(value);
var toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
var cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
var camelizeRE = /-(\w)/g;
var camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
});
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
var capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
var toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
var hasChanged = (value, oldValue) => value !== oldValue && (value === value || oldValue === oldValue);

// node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
var targetMap = /* @__PURE__ */ new WeakMap();
var effectStack = [];
var activeEffect;
var ITERATE_KEY = Symbol( true ? "iterate" : 0);
var MAP_KEY_ITERATE_KEY = Symbol( true ? "Map key iterate" : 0);
function isEffect(fn) {
  return fn && fn._isEffect === true;
}
function effect2(fn, options = EMPTY_OBJ) {
  if (isEffect(fn)) {
    fn = fn.raw;
  }
  const effect3 = createReactiveEffect(fn, options);
  if (!options.lazy) {
    effect3();
  }
  return effect3;
}
function stop(effect3) {
  if (effect3.active) {
    cleanup(effect3);
    if (effect3.options.onStop) {
      effect3.options.onStop();
    }
    effect3.active = false;
  }
}
var uid = 0;
function createReactiveEffect(fn, options) {
  const effect3 = function reactiveEffect() {
    if (!effect3.active) {
      return fn();
    }
    if (!effectStack.includes(effect3)) {
      cleanup(effect3);
      try {
        enableTracking();
        effectStack.push(effect3);
        activeEffect = effect3;
        return fn();
      } finally {
        effectStack.pop();
        resetTracking();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };
  effect3.id = uid++;
  effect3.allowRecurse = !!options.allowRecurse;
  effect3._isEffect = true;
  effect3.active = true;
  effect3.raw = fn;
  effect3.deps = [];
  effect3.options = options;
  return effect3;
}
function cleanup(effect3) {
  const { deps } = effect3;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect3);
    }
    deps.length = 0;
  }
}
var shouldTrack = true;
var trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function enableTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = true;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function track(target, type, key) {
  if (!shouldTrack || activeEffect === void 0) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, dep = /* @__PURE__ */ new Set());
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
    if (activeEffect.options.onTrack) {
      activeEffect.options.onTrack({
        effect: activeEffect,
        target,
        type,
        key
      });
    }
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const effects = /* @__PURE__ */ new Set();
  const add2 = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach((effect3) => {
        if (effect3 !== activeEffect || effect3.allowRecurse) {
          effects.add(effect3);
        }
      });
    }
  };
  if (type === "clear") {
    depsMap.forEach(add2);
  } else if (key === "length" && isArray(target)) {
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || key2 >= newValue) {
        add2(dep);
      }
    });
  } else {
    if (key !== void 0) {
      add2(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray(target)) {
          add2(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            add2(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          add2(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray(target)) {
          add2(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            add2(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap(target)) {
          add2(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  const run = (effect3) => {
    if (effect3.options.onTrigger) {
      effect3.options.onTrigger({
        effect: effect3,
        target,
        key,
        type,
        newValue,
        oldValue,
        oldTarget
      });
    }
    if (effect3.options.scheduler) {
      effect3.options.scheduler(effect3);
    } else {
      effect3();
    }
  };
  effects.forEach(run);
}
var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
var builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol).map((key) => Symbol[key]).filter(isSymbol));
var get2 = /* @__PURE__ */ createGetter();
var readonlyGet = /* @__PURE__ */ createGetter(true);
var arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, "get", i + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      const res = toRaw(this)[key].apply(this, args);
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function createGetter(isReadonly = false, shallow = false) {
  return function get3(target, key, receiver) {
    if (key === "__v_isReactive") {
      return !isReadonly;
    } else if (key === "__v_isReadonly") {
      return isReadonly;
    } else if (key === "__v_raw" && receiver === (isReadonly ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
      return target;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver);
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly) {
      track(target, "get", key);
    }
    if (shallow) {
      return res;
    }
    if (isRef(res)) {
      const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
      return shouldUnwrap ? res.value : res;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive2(res);
    }
    return res;
  };
}
var set2 = /* @__PURE__ */ createSetter();
function createSetter(shallow = false) {
  return function set3(target, key, value, receiver) {
    let oldValue = target[key];
    if (!shallow) {
      value = toRaw(value);
      oldValue = toRaw(oldValue);
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      }
    }
    const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value, oldValue);
      }
    }
    return result;
  };
}
function deleteProperty(target, key) {
  const hadKey = hasOwn(target, key);
  const oldValue = target[key];
  const result = Reflect.deleteProperty(target, key);
  if (result && hadKey) {
    trigger(target, "delete", key, void 0, oldValue);
  }
  return result;
}
function has(target, key) {
  const result = Reflect.has(target, key);
  if (!isSymbol(key) || !builtInSymbols.has(key)) {
    track(target, "has", key);
  }
  return result;
}
function ownKeys(target) {
  track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
  return Reflect.ownKeys(target);
}
var mutableHandlers = {
  get: get2,
  set: set2,
  deleteProperty,
  has,
  ownKeys
};
var readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    if (true) {
      console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
    }
    return true;
  },
  deleteProperty(target, key) {
    if (true) {
      console.warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
    }
    return true;
  }
};
var toReactive = (value) => isObject(value) ? reactive2(value) : value;
var toReadonly = (value) => isObject(value) ? readonly(value) : value;
var toShallow = (value) => value;
var getProto = (v) => Reflect.getPrototypeOf(v);
function get$1(target, key, isReadonly = false, isShallow = false) {
  target = target[
    "__v_raw"
    /* RAW */
  ];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (key !== rawKey) {
    !isReadonly && track(rawTarget, "get", key);
  }
  !isReadonly && track(rawTarget, "get", rawKey);
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has$1(key, isReadonly = false) {
  const target = this[
    "__v_raw"
    /* RAW */
  ];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (key !== rawKey) {
    !isReadonly && track(rawTarget, "has", key);
  }
  !isReadonly && track(rawTarget, "has", rawKey);
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly = false) {
  target = target[
    "__v_raw"
    /* RAW */
  ];
  !isReadonly && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set$1(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get3 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  } else if (true) {
    checkIdentityKeys(target, has2, key);
  }
  const oldValue = get3.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger(target, "set", key, value, oldValue);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get3 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  } else if (true) {
    checkIdentityKeys(target, has2, key);
  }
  const oldValue = get3 ? get3.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0, oldValue);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const oldTarget =  true ? isMap(target) ? new Map(target) : new Set(target) : 0;
  const result = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0, oldTarget);
  }
  return result;
}
function createForEach(isReadonly, isShallow) {
  return function forEach(callback, thisArg) {
    const observed = this;
    const target = observed[
      "__v_raw"
      /* RAW */
    ];
    const rawTarget = toRaw(target);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    !isReadonly && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly, isShallow) {
  return function(...args) {
    const target = this[
      "__v_raw"
      /* RAW */
    ];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    !isReadonly && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    if (true) {
      const key = args[0] ? `on key "${args[0]}" ` : ``;
      console.warn(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
    }
    return type === "delete" ? false : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get$1(this, key);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get$1(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get$1(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod(
      "add"
      /* ADD */
    ),
    set: createReadonlyMethod(
      "set"
      /* SET */
    ),
    delete: createReadonlyMethod(
      "delete"
      /* DELETE */
    ),
    clear: createReadonlyMethod(
      "clear"
      /* CLEAR */
    ),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get$1(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod(
      "add"
      /* ADD */
    ),
    set: createReadonlyMethod(
      "set"
      /* SET */
    ),
    delete: createReadonlyMethod(
      "delete"
      /* DELETE */
    ),
    clear: createReadonlyMethod(
      "clear"
      /* CLEAR */
    ),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
    shallowInstrumentations2[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
var [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly, shallow) {
  const instrumentations = shallow ? isReadonly ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly;
    } else if (key === "__v_isReadonly") {
      return isReadonly;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
  };
}
var mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
var readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
function checkIdentityKeys(target, has2, key) {
  const rawKey = toRaw(key);
  if (rawKey !== key && has2.call(target, rawKey)) {
    const type = toRawType(target);
    console.warn(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
  }
}
var reactiveMap = /* @__PURE__ */ new WeakMap();
var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
var readonlyMap = /* @__PURE__ */ new WeakMap();
var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value[
    "__v_skip"
    /* SKIP */
  ] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive2(target) {
  if (target && target[
    "__v_isReadonly"
    /* IS_READONLY */
  ]) {
    return target;
  }
  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    if (true) {
      console.warn(`value cannot be made reactive: ${String(target)}`);
    }
    return target;
  }
  if (target[
    "__v_raw"
    /* RAW */
  ] && !(isReadonly && target[
    "__v_isReactive"
    /* IS_REACTIVE */
  ])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}
function toRaw(observed) {
  return observed && toRaw(observed[
    "__v_raw"
    /* RAW */
  ]) || observed;
}
function isRef(r) {
  return Boolean(r && r.__v_isRef === true);
}

// packages/alpinejs/src/magics/$nextTick.js
magic("nextTick", () => nextTick);

// packages/alpinejs/src/magics/$dispatch.js
magic("dispatch", (el) => dispatch.bind(dispatch, el));

// packages/alpinejs/src/magics/$watch.js
magic("watch", (el, { evaluateLater: evaluateLater2, effect: effect3 }) => (key, callback) => {
  let evaluate2 = evaluateLater2(key);
  let firstTime = true;
  let oldValue;
  let effectReference = effect3(() => evaluate2((value) => {
    JSON.stringify(value);
    if (!firstTime) {
      queueMicrotask(() => {
        callback(value, oldValue);
        oldValue = value;
      });
    } else {
      oldValue = value;
    }
    firstTime = false;
  }));
  el._x_effects.delete(effectReference);
});

// packages/alpinejs/src/magics/$store.js
magic("store", getStores);

// packages/alpinejs/src/magics/$data.js
magic("data", (el) => scope(el));

// packages/alpinejs/src/magics/$root.js
magic("root", (el) => closestRoot(el));

// packages/alpinejs/src/magics/$refs.js
magic("refs", (el) => {
  if (el._x_refs_proxy)
    return el._x_refs_proxy;
  el._x_refs_proxy = mergeProxies(getArrayOfRefObject(el));
  return el._x_refs_proxy;
});
function getArrayOfRefObject(el) {
  let refObjects = [];
  let currentEl = el;
  while (currentEl) {
    if (currentEl._x_refs)
      refObjects.push(currentEl._x_refs);
    currentEl = currentEl.parentNode;
  }
  return refObjects;
}

// packages/alpinejs/src/ids.js
var globalIdMemo = {};
function findAndIncrementId(name) {
  if (!globalIdMemo[name])
    globalIdMemo[name] = 0;
  return ++globalIdMemo[name];
}
function closestIdRoot(el, name) {
  return findClosest(el, (element) => {
    if (element._x_ids && element._x_ids[name])
      return true;
  });
}
function setIdRoot(el, name) {
  if (!el._x_ids)
    el._x_ids = {};
  if (!el._x_ids[name])
    el._x_ids[name] = findAndIncrementId(name);
}

// packages/alpinejs/src/magics/$id.js
magic("id", (el) => (name, key = null) => {
  let root = closestIdRoot(el, name);
  let id = root ? root._x_ids[name] : findAndIncrementId(name);
  return key ? `${name}-${id}-${key}` : `${name}-${id}`;
});

// packages/alpinejs/src/magics/$el.js
magic("el", (el) => el);

// packages/alpinejs/src/magics/index.js
warnMissingPluginMagic("Focus", "focus", "focus");
warnMissingPluginMagic("Persist", "persist", "persist");
function warnMissingPluginMagic(name, magicName, slug) {
  magic(magicName, (el) => warn(`You can't use [$${magicName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`, el));
}

// packages/alpinejs/src/directives/x-modelable.js
directive("modelable", (el, { expression }, { effect: effect3, evaluateLater: evaluateLater2, cleanup: cleanup2 }) => {
  let func = evaluateLater2(expression);
  let innerGet = () => {
    let result;
    func((i) => result = i);
    return result;
  };
  let evaluateInnerSet = evaluateLater2(`${expression} = __placeholder`);
  let innerSet = (val) => evaluateInnerSet(() => {
  }, { scope: { "__placeholder": val } });
  let initialValue = innerGet();
  innerSet(initialValue);
  queueMicrotask(() => {
    if (!el._x_model)
      return;
    el._x_removeModelListeners["default"]();
    let outerGet = el._x_model.get;
    let outerSet = el._x_model.set;
    let releaseEntanglement = entangle(
      {
        get() {
          return outerGet();
        },
        set(value) {
          outerSet(value);
        }
      },
      {
        get() {
          return innerGet();
        },
        set(value) {
          innerSet(value);
        }
      }
    );
    cleanup2(releaseEntanglement);
  });
});

// packages/alpinejs/src/directives/x-teleport.js
directive("teleport", (el, { modifiers, expression }, { cleanup: cleanup2 }) => {
  if (el.tagName.toLowerCase() !== "template")
    warn("x-teleport can only be used on a <template> tag", el);
  let target = getTarget(expression);
  let clone2 = el.content.cloneNode(true).firstElementChild;
  el._x_teleport = clone2;
  clone2._x_teleportBack = el;
  el.setAttribute("data-teleport-template", true);
  clone2.setAttribute("data-teleport-target", true);
  if (el._x_forwardEvents) {
    el._x_forwardEvents.forEach((eventName) => {
      clone2.addEventListener(eventName, (e) => {
        e.stopPropagation();
        el.dispatchEvent(new e.constructor(e.type, e));
      });
    });
  }
  addScopeToNode(clone2, {}, el);
  let placeInDom = (clone3, target2, modifiers2) => {
    if (modifiers2.includes("prepend")) {
      target2.parentNode.insertBefore(clone3, target2);
    } else if (modifiers2.includes("append")) {
      target2.parentNode.insertBefore(clone3, target2.nextSibling);
    } else {
      target2.appendChild(clone3);
    }
  };
  mutateDom(() => {
    placeInDom(clone2, target, modifiers);
    initTree(clone2);
    clone2._x_ignore = true;
  });
  el._x_teleportPutBack = () => {
    let target2 = getTarget(expression);
    mutateDom(() => {
      placeInDom(el._x_teleport, target2, modifiers);
    });
  };
  cleanup2(() => clone2.remove());
});
var teleportContainerDuringClone = document.createElement("div");
function getTarget(expression) {
  let target = skipDuringClone(() => {
    return document.querySelector(expression);
  }, () => {
    return teleportContainerDuringClone;
  })();
  if (!target)
    warn(`Cannot find x-teleport element for selector: "${expression}"`);
  return target;
}

// packages/alpinejs/src/directives/x-ignore.js
var handler = () => {
};
handler.inline = (el, { modifiers }, { cleanup: cleanup2 }) => {
  modifiers.includes("self") ? el._x_ignoreSelf = true : el._x_ignore = true;
  cleanup2(() => {
    modifiers.includes("self") ? delete el._x_ignoreSelf : delete el._x_ignore;
  });
};
directive("ignore", handler);

// packages/alpinejs/src/directives/x-effect.js
directive("effect", (el, { expression }, { effect: effect3 }) => effect3(evaluateLater(el, expression)));

// packages/alpinejs/src/utils/on.js
function on(el, event, modifiers, callback) {
  let listenerTarget = el;
  let handler4 = (e) => callback(e);
  let options = {};
  let wrapHandler = (callback2, wrapper) => (e) => wrapper(callback2, e);
  if (modifiers.includes("dot"))
    event = dotSyntax(event);
  if (modifiers.includes("camel"))
    event = camelCase2(event);
  if (modifiers.includes("passive"))
    options.passive = true;
  if (modifiers.includes("capture"))
    options.capture = true;
  if (modifiers.includes("window"))
    listenerTarget = window;
  if (modifiers.includes("document"))
    listenerTarget = document;
  if (modifiers.includes("debounce")) {
    let nextModifier = modifiers[modifiers.indexOf("debounce") + 1] || "invalid-wait";
    let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
    handler4 = debounce(handler4, wait);
  }
  if (modifiers.includes("throttle")) {
    let nextModifier = modifiers[modifiers.indexOf("throttle") + 1] || "invalid-wait";
    let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
    handler4 = throttle(handler4, wait);
  }
  if (modifiers.includes("prevent"))
    handler4 = wrapHandler(handler4, (next, e) => {
      e.preventDefault();
      next(e);
    });
  if (modifiers.includes("stop"))
    handler4 = wrapHandler(handler4, (next, e) => {
      e.stopPropagation();
      next(e);
    });
  if (modifiers.includes("self"))
    handler4 = wrapHandler(handler4, (next, e) => {
      e.target === el && next(e);
    });
  if (modifiers.includes("away") || modifiers.includes("outside")) {
    listenerTarget = document;
    handler4 = wrapHandler(handler4, (next, e) => {
      if (el.contains(e.target))
        return;
      if (e.target.isConnected === false)
        return;
      if (el.offsetWidth < 1 && el.offsetHeight < 1)
        return;
      if (el._x_isShown === false)
        return;
      next(e);
    });
  }
  if (modifiers.includes("once")) {
    handler4 = wrapHandler(handler4, (next, e) => {
      next(e);
      listenerTarget.removeEventListener(event, handler4, options);
    });
  }
  handler4 = wrapHandler(handler4, (next, e) => {
    if (isKeyEvent(event)) {
      if (isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers)) {
        return;
      }
    }
    next(e);
  });
  listenerTarget.addEventListener(event, handler4, options);
  return () => {
    listenerTarget.removeEventListener(event, handler4, options);
  };
}
function dotSyntax(subject) {
  return subject.replace(/-/g, ".");
}
function camelCase2(subject) {
  return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
}
function isNumeric(subject) {
  return !Array.isArray(subject) && !isNaN(subject);
}
function kebabCase2(subject) {
  if ([" ", "_"].includes(
    subject
  ))
    return subject;
  return subject.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]/, "-").toLowerCase();
}
function isKeyEvent(event) {
  return ["keydown", "keyup"].includes(event);
}
function isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers) {
  let keyModifiers = modifiers.filter((i) => {
    return !["window", "document", "prevent", "stop", "once", "capture"].includes(i);
  });
  if (keyModifiers.includes("debounce")) {
    let debounceIndex = keyModifiers.indexOf("debounce");
    keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
  }
  if (keyModifiers.includes("throttle")) {
    let debounceIndex = keyModifiers.indexOf("throttle");
    keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
  }
  if (keyModifiers.length === 0)
    return false;
  if (keyModifiers.length === 1 && keyToModifiers(e.key).includes(keyModifiers[0]))
    return false;
  const systemKeyModifiers = ["ctrl", "shift", "alt", "meta", "cmd", "super"];
  const selectedSystemKeyModifiers = systemKeyModifiers.filter((modifier) => keyModifiers.includes(modifier));
  keyModifiers = keyModifiers.filter((i) => !selectedSystemKeyModifiers.includes(i));
  if (selectedSystemKeyModifiers.length > 0) {
    const activelyPressedKeyModifiers = selectedSystemKeyModifiers.filter((modifier) => {
      if (modifier === "cmd" || modifier === "super")
        modifier = "meta";
      return e[`${modifier}Key`];
    });
    if (activelyPressedKeyModifiers.length === selectedSystemKeyModifiers.length) {
      if (keyToModifiers(e.key).includes(keyModifiers[0]))
        return false;
    }
  }
  return true;
}
function keyToModifiers(key) {
  if (!key)
    return [];
  key = kebabCase2(key);
  let modifierToKeyMap = {
    "ctrl": "control",
    "slash": "/",
    "space": " ",
    "spacebar": " ",
    "cmd": "meta",
    "esc": "escape",
    "up": "arrow-up",
    "down": "arrow-down",
    "left": "arrow-left",
    "right": "arrow-right",
    "period": ".",
    "equal": "=",
    "minus": "-",
    "underscore": "_"
  };
  modifierToKeyMap[key] = key;
  return Object.keys(modifierToKeyMap).map((modifier) => {
    if (modifierToKeyMap[modifier] === key)
      return modifier;
  }).filter((modifier) => modifier);
}

// packages/alpinejs/src/directives/x-model.js
directive("model", (el, { modifiers, expression }, { effect: effect3, cleanup: cleanup2 }) => {
  let scopeTarget = el;
  if (modifiers.includes("parent")) {
    scopeTarget = el.parentNode;
  }
  let evaluateGet = evaluateLater(scopeTarget, expression);
  let evaluateSet;
  if (typeof expression === "string") {
    evaluateSet = evaluateLater(scopeTarget, `${expression} = __placeholder`);
  } else if (typeof expression === "function" && typeof expression() === "string") {
    evaluateSet = evaluateLater(scopeTarget, `${expression()} = __placeholder`);
  } else {
    evaluateSet = () => {
    };
  }
  let getValue = () => {
    let result;
    evaluateGet((value) => result = value);
    return isGetterSetter(result) ? result.get() : result;
  };
  let setValue = (value) => {
    let result;
    evaluateGet((value2) => result = value2);
    if (isGetterSetter(result)) {
      result.set(value);
    } else {
      evaluateSet(() => {
      }, {
        scope: { "__placeholder": value }
      });
    }
  };
  if (typeof expression === "string" && el.type === "radio") {
    mutateDom(() => {
      if (!el.hasAttribute("name"))
        el.setAttribute("name", expression);
    });
  }
  var event = el.tagName.toLowerCase() === "select" || ["checkbox", "radio"].includes(el.type) || modifiers.includes("lazy") ? "change" : "input";
  let removeListener = isCloning ? () => {
  } : on(el, event, modifiers, (e) => {
    setValue(getInputValue(el, modifiers, e, getValue()));
  });
  if (modifiers.includes("fill")) {
    if ([null, ""].includes(getValue()) || el.type === "checkbox" && Array.isArray(getValue())) {
      el.dispatchEvent(new Event(event, {}));
    }
  }
  if (!el._x_removeModelListeners)
    el._x_removeModelListeners = {};
  el._x_removeModelListeners["default"] = removeListener;
  cleanup2(() => el._x_removeModelListeners["default"]());
  if (el.form) {
    let removeResetListener = on(el.form, "reset", [], (e) => {
      nextTick(() => el._x_model && el._x_model.set(el.value));
    });
    cleanup2(() => removeResetListener());
  }
  el._x_model = {
    get() {
      return getValue();
    },
    set(value) {
      setValue(value);
    }
  };
  el._x_forceModelUpdate = (value) => {
    if (value === void 0 && typeof expression === "string" && expression.match(/\./))
      value = "";
    window.fromModel = true;
    mutateDom(() => bind(el, "value", value));
    delete window.fromModel;
  };
  effect3(() => {
    let value = getValue();
    if (modifiers.includes("unintrusive") && document.activeElement.isSameNode(el))
      return;
    el._x_forceModelUpdate(value);
  });
});
function getInputValue(el, modifiers, event, currentValue) {
  return mutateDom(() => {
    if (event instanceof CustomEvent && event.detail !== void 0)
      return event.detail !== null && event.detail !== void 0 ? event.detail : event.target.value;
    else if (el.type === "checkbox") {
      if (Array.isArray(currentValue)) {
        let newValue = modifiers.includes("number") ? safeParseNumber(event.target.value) : event.target.value;
        return event.target.checked ? currentValue.concat([newValue]) : currentValue.filter((el2) => !checkedAttrLooseCompare2(el2, newValue));
      } else {
        return event.target.checked;
      }
    } else if (el.tagName.toLowerCase() === "select" && el.multiple) {
      return modifiers.includes("number") ? Array.from(event.target.selectedOptions).map((option) => {
        let rawValue = option.value || option.text;
        return safeParseNumber(rawValue);
      }) : Array.from(event.target.selectedOptions).map((option) => {
        return option.value || option.text;
      });
    } else {
      let rawValue = event.target.value;
      return modifiers.includes("number") ? safeParseNumber(rawValue) : modifiers.includes("trim") ? rawValue.trim() : rawValue;
    }
  });
}
function safeParseNumber(rawValue) {
  let number = rawValue ? parseFloat(rawValue) : null;
  return isNumeric2(number) ? number : rawValue;
}
function checkedAttrLooseCompare2(valueA, valueB) {
  return valueA == valueB;
}
function isNumeric2(subject) {
  return !Array.isArray(subject) && !isNaN(subject);
}
function isGetterSetter(value) {
  return value !== null && typeof value === "object" && typeof value.get === "function" && typeof value.set === "function";
}

// packages/alpinejs/src/directives/x-cloak.js
directive("cloak", (el) => queueMicrotask(() => mutateDom(() => el.removeAttribute(prefix("cloak")))));

// packages/alpinejs/src/directives/x-init.js
addInitSelector(() => `[${prefix("init")}]`);
directive("init", skipDuringClone((el, { expression }, { evaluate: evaluate2 }) => {
  if (typeof expression === "string") {
    return !!expression.trim() && evaluate2(expression, {}, false);
  }
  return evaluate2(expression, {}, false);
}));

// packages/alpinejs/src/directives/x-text.js
directive("text", (el, { expression }, { effect: effect3, evaluateLater: evaluateLater2 }) => {
  let evaluate2 = evaluateLater2(expression);
  effect3(() => {
    evaluate2((value) => {
      mutateDom(() => {
        el.textContent = value;
      });
    });
  });
});

// packages/alpinejs/src/directives/x-html.js
directive("html", (el, { expression }, { effect: effect3, evaluateLater: evaluateLater2 }) => {
  let evaluate2 = evaluateLater2(expression);
  effect3(() => {
    evaluate2((value) => {
      mutateDom(() => {
        el.innerHTML = value;
        el._x_ignoreSelf = true;
        initTree(el);
        delete el._x_ignoreSelf;
      });
    });
  });
});

// packages/alpinejs/src/directives/x-bind.js
mapAttributes(startingWith(":", into(prefix("bind:"))));
var handler2 = (el, { value, modifiers, expression, original }, { effect: effect3 }) => {
  if (!value) {
    let bindingProviders = {};
    injectBindingProviders(bindingProviders);
    let getBindings = evaluateLater(el, expression);
    getBindings((bindings) => {
      applyBindingsObject(el, bindings, original);
    }, { scope: bindingProviders });
    return;
  }
  if (value === "key")
    return storeKeyForXFor(el, expression);
  if (el._x_inlineBindings && el._x_inlineBindings[value] && el._x_inlineBindings[value].extract) {
    return;
  }
  let evaluate2 = evaluateLater(el, expression);
  effect3(() => evaluate2((result) => {
    if (result === void 0 && typeof expression === "string" && expression.match(/\./)) {
      result = "";
    }
    mutateDom(() => bind(el, value, result, modifiers));
  }));
};
handler2.inline = (el, { value, modifiers, expression }) => {
  if (!value)
    return;
  if (!el._x_inlineBindings)
    el._x_inlineBindings = {};
  el._x_inlineBindings[value] = { expression, extract: false };
};
directive("bind", handler2);
function storeKeyForXFor(el, expression) {
  el._x_keyExpression = expression;
}

// packages/alpinejs/src/directives/x-data.js
addRootSelector(() => `[${prefix("data")}]`);
directive("data", (el, { expression }, { cleanup: cleanup2 }) => {
  if (shouldSkipRegisteringDataDuringClone(el))
    return;
  expression = expression === "" ? "{}" : expression;
  let magicContext = {};
  injectMagics(magicContext, el);
  let dataProviderContext = {};
  injectDataProviders(dataProviderContext, magicContext);
  let data2 = evaluate(el, expression, { scope: dataProviderContext });
  if (data2 === void 0 || data2 === true)
    data2 = {};
  injectMagics(data2, el);
  let reactiveData = reactive(data2);
  initInterceptors2(reactiveData);
  let undo = addScopeToNode(el, reactiveData);
  reactiveData["init"] && evaluate(el, reactiveData["init"]);
  cleanup2(() => {
    reactiveData["destroy"] && evaluate(el, reactiveData["destroy"]);
    undo();
  });
});

// packages/alpinejs/src/directives/x-show.js
directive("show", (el, { modifiers, expression }, { effect: effect3 }) => {
  let evaluate2 = evaluateLater(el, expression);
  if (!el._x_doHide)
    el._x_doHide = () => {
      mutateDom(() => {
        el.style.setProperty("display", "none", modifiers.includes("important") ? "important" : void 0);
      });
    };
  if (!el._x_doShow)
    el._x_doShow = () => {
      mutateDom(() => {
        if (el.style.length === 1 && el.style.display === "none") {
          el.removeAttribute("style");
        } else {
          el.style.removeProperty("display");
        }
      });
    };
  let hide = () => {
    el._x_doHide();
    el._x_isShown = false;
  };
  let show = () => {
    el._x_doShow();
    el._x_isShown = true;
  };
  let clickAwayCompatibleShow = () => setTimeout(show);
  let toggle = once(
    (value) => value ? show() : hide(),
    (value) => {
      if (typeof el._x_toggleAndCascadeWithTransitions === "function") {
        el._x_toggleAndCascadeWithTransitions(el, value, show, hide);
      } else {
        value ? clickAwayCompatibleShow() : hide();
      }
    }
  );
  let oldValue;
  let firstTime = true;
  effect3(() => evaluate2((value) => {
    if (!firstTime && value === oldValue)
      return;
    if (modifiers.includes("immediate"))
      value ? clickAwayCompatibleShow() : hide();
    toggle(value);
    oldValue = value;
    firstTime = false;
  }));
});

// packages/alpinejs/src/directives/x-for.js
directive("for", (el, { expression }, { effect: effect3, cleanup: cleanup2 }) => {
  let iteratorNames = parseForExpression(expression);
  let evaluateItems = evaluateLater(el, iteratorNames.items);
  let evaluateKey = evaluateLater(
    el,
    // the x-bind:key expression is stored for our use instead of evaluated.
    el._x_keyExpression || "index"
  );
  el._x_prevKeys = [];
  el._x_lookup = {};
  effect3(() => loop(el, iteratorNames, evaluateItems, evaluateKey));
  cleanup2(() => {
    Object.values(el._x_lookup).forEach((el2) => el2.remove());
    delete el._x_prevKeys;
    delete el._x_lookup;
  });
});
function loop(el, iteratorNames, evaluateItems, evaluateKey) {
  let isObject2 = (i) => typeof i === "object" && !Array.isArray(i);
  let templateEl = el;
  evaluateItems((items) => {
    if (isNumeric3(items) && items >= 0) {
      items = Array.from(Array(items).keys(), (i) => i + 1);
    }
    if (items === void 0)
      items = [];
    let lookup = el._x_lookup;
    let prevKeys = el._x_prevKeys;
    let scopes = [];
    let keys = [];
    if (isObject2(items)) {
      items = Object.entries(items).map(([key, value]) => {
        let scope2 = getIterationScopeVariables(iteratorNames, value, key, items);
        evaluateKey((value2) => keys.push(value2), { scope: { index: key, ...scope2 } });
        scopes.push(scope2);
      });
    } else {
      for (let i = 0; i < items.length; i++) {
        let scope2 = getIterationScopeVariables(iteratorNames, items[i], i, items);
        evaluateKey((value) => keys.push(value), { scope: { index: i, ...scope2 } });
        scopes.push(scope2);
      }
    }
    let adds = [];
    let moves = [];
    let removes = [];
    let sames = [];
    for (let i = 0; i < prevKeys.length; i++) {
      let key = prevKeys[i];
      if (keys.indexOf(key) === -1)
        removes.push(key);
    }
    prevKeys = prevKeys.filter((key) => !removes.includes(key));
    let lastKey = "template";
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let prevIndex = prevKeys.indexOf(key);
      if (prevIndex === -1) {
        prevKeys.splice(i, 0, key);
        adds.push([lastKey, i]);
      } else if (prevIndex !== i) {
        let keyInSpot = prevKeys.splice(i, 1)[0];
        let keyForSpot = prevKeys.splice(prevIndex - 1, 1)[0];
        prevKeys.splice(i, 0, keyForSpot);
        prevKeys.splice(prevIndex, 0, keyInSpot);
        moves.push([keyInSpot, keyForSpot]);
      } else {
        sames.push(key);
      }
      lastKey = key;
    }
    for (let i = 0; i < removes.length; i++) {
      let key = removes[i];
      if (!!lookup[key]._x_effects) {
        lookup[key]._x_effects.forEach(dequeueJob);
      }
      lookup[key].remove();
      lookup[key] = null;
      delete lookup[key];
    }
    for (let i = 0; i < moves.length; i++) {
      let [keyInSpot, keyForSpot] = moves[i];
      let elInSpot = lookup[keyInSpot];
      let elForSpot = lookup[keyForSpot];
      let marker = document.createElement("div");
      mutateDom(() => {
        if (!elForSpot)
          warn(`x-for ":key" is undefined or invalid`, templateEl);
        elForSpot.after(marker);
        elInSpot.after(elForSpot);
        elForSpot._x_currentIfEl && elForSpot.after(elForSpot._x_currentIfEl);
        marker.before(elInSpot);
        elInSpot._x_currentIfEl && elInSpot.after(elInSpot._x_currentIfEl);
        marker.remove();
      });
      elForSpot._x_refreshXForScope(scopes[keys.indexOf(keyForSpot)]);
    }
    for (let i = 0; i < adds.length; i++) {
      let [lastKey2, index] = adds[i];
      let lastEl = lastKey2 === "template" ? templateEl : lookup[lastKey2];
      if (lastEl._x_currentIfEl)
        lastEl = lastEl._x_currentIfEl;
      let scope2 = scopes[index];
      let key = keys[index];
      let clone2 = document.importNode(templateEl.content, true).firstElementChild;
      let reactiveScope = reactive(scope2);
      addScopeToNode(clone2, reactiveScope, templateEl);
      clone2._x_refreshXForScope = (newScope) => {
        Object.entries(newScope).forEach(([key2, value]) => {
          reactiveScope[key2] = value;
        });
      };
      mutateDom(() => {
        lastEl.after(clone2);
        initTree(clone2);
      });
      if (typeof key === "object") {
        warn("x-for key cannot be an object, it must be a string or an integer", templateEl);
      }
      lookup[key] = clone2;
    }
    for (let i = 0; i < sames.length; i++) {
      lookup[sames[i]]._x_refreshXForScope(scopes[keys.indexOf(sames[i])]);
    }
    templateEl._x_prevKeys = keys;
  });
}
function parseForExpression(expression) {
  let forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
  let stripParensRE = /^\s*\(|\)\s*$/g;
  let forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
  let inMatch = expression.match(forAliasRE);
  if (!inMatch)
    return;
  let res = {};
  res.items = inMatch[2].trim();
  let item = inMatch[1].replace(stripParensRE, "").trim();
  let iteratorMatch = item.match(forIteratorRE);
  if (iteratorMatch) {
    res.item = item.replace(forIteratorRE, "").trim();
    res.index = iteratorMatch[1].trim();
    if (iteratorMatch[2]) {
      res.collection = iteratorMatch[2].trim();
    }
  } else {
    res.item = item;
  }
  return res;
}
function getIterationScopeVariables(iteratorNames, item, index, items) {
  let scopeVariables = {};
  if (/^\[.*\]$/.test(iteratorNames.item) && Array.isArray(item)) {
    let names = iteratorNames.item.replace("[", "").replace("]", "").split(",").map((i) => i.trim());
    names.forEach((name, i) => {
      scopeVariables[name] = item[i];
    });
  } else if (/^\{.*\}$/.test(iteratorNames.item) && !Array.isArray(item) && typeof item === "object") {
    let names = iteratorNames.item.replace("{", "").replace("}", "").split(",").map((i) => i.trim());
    names.forEach((name) => {
      scopeVariables[name] = item[name];
    });
  } else {
    scopeVariables[iteratorNames.item] = item;
  }
  if (iteratorNames.index)
    scopeVariables[iteratorNames.index] = index;
  if (iteratorNames.collection)
    scopeVariables[iteratorNames.collection] = items;
  return scopeVariables;
}
function isNumeric3(subject) {
  return !Array.isArray(subject) && !isNaN(subject);
}

// packages/alpinejs/src/directives/x-ref.js
function handler3() {
}
handler3.inline = (el, { expression }, { cleanup: cleanup2 }) => {
  let root = closestRoot(el);
  if (!root._x_refs)
    root._x_refs = {};
  root._x_refs[expression] = el;
  cleanup2(() => delete root._x_refs[expression]);
};
directive("ref", handler3);

// packages/alpinejs/src/directives/x-if.js
directive("if", (el, { expression }, { effect: effect3, cleanup: cleanup2 }) => {
  if (el.tagName.toLowerCase() !== "template")
    warn("x-if can only be used on a <template> tag", el);
  let evaluate2 = evaluateLater(el, expression);
  let show = () => {
    if (el._x_currentIfEl)
      return el._x_currentIfEl;
    let clone2 = el.content.cloneNode(true).firstElementChild;
    addScopeToNode(clone2, {}, el);
    mutateDom(() => {
      el.after(clone2);
      initTree(clone2);
    });
    el._x_currentIfEl = clone2;
    el._x_undoIf = () => {
      walk(clone2, (node) => {
        if (!!node._x_effects) {
          node._x_effects.forEach(dequeueJob);
        }
      });
      clone2.remove();
      delete el._x_currentIfEl;
    };
    return clone2;
  };
  let hide = () => {
    if (!el._x_undoIf)
      return;
    el._x_undoIf();
    delete el._x_undoIf;
  };
  effect3(() => evaluate2((value) => {
    value ? show() : hide();
  }));
  cleanup2(() => el._x_undoIf && el._x_undoIf());
});

// packages/alpinejs/src/directives/x-id.js
directive("id", (el, { expression }, { evaluate: evaluate2 }) => {
  let names = evaluate2(expression);
  names.forEach((name) => setIdRoot(el, name));
});

// packages/alpinejs/src/directives/x-on.js
mapAttributes(startingWith("@", into(prefix("on:"))));
directive("on", skipDuringClone((el, { value, modifiers, expression }, { cleanup: cleanup2 }) => {
  let evaluate2 = expression ? evaluateLater(el, expression) : () => {
  };
  if (el.tagName.toLowerCase() === "template") {
    if (!el._x_forwardEvents)
      el._x_forwardEvents = [];
    if (!el._x_forwardEvents.includes(value))
      el._x_forwardEvents.push(value);
  }
  let removeListener = on(el, value, modifiers, (e) => {
    evaluate2(() => {
    }, { scope: { "$event": e }, params: [e] });
  });
  cleanup2(() => removeListener());
}));

// packages/alpinejs/src/directives/index.js
warnMissingPluginDirective("Collapse", "collapse", "collapse");
warnMissingPluginDirective("Intersect", "intersect", "intersect");
warnMissingPluginDirective("Focus", "trap", "focus");
warnMissingPluginDirective("Mask", "mask", "mask");
function warnMissingPluginDirective(name, directiveName, slug) {
  directive(directiveName, (el) => warn(`You can't use [x-${directiveName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`, el));
}

// packages/alpinejs/src/index.js
alpine_default.setEvaluator(normalEvaluator);
alpine_default.setReactivityEngine({ reactive: reactive2, effect: effect2, release: stop, raw: toRaw });
var src_default = alpine_default;

// packages/alpinejs/builds/module.js
var module_default = src_default;



/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[6].oneOf[1].use[1]!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[6].oneOf[1].use[2]!./node_modules/@fortawesome/fontawesome-free/css/all.css":
/*!**************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[6].oneOf[1].use[1]!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[6].oneOf[1].use[2]!./node_modules/@fortawesome/fontawesome-free/css/all.css ***!
  \**************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _webfonts_fa_brands_400_woff2__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../webfonts/fa-brands-400.woff2 */ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.woff2");
/* harmony import */ var _webfonts_fa_brands_400_ttf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../webfonts/fa-brands-400.ttf */ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.ttf");
/* harmony import */ var _webfonts_fa_regular_400_woff2__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../webfonts/fa-regular-400.woff2 */ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-regular-400.woff2");
/* harmony import */ var _webfonts_fa_regular_400_ttf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../webfonts/fa-regular-400.ttf */ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-regular-400.ttf");
/* harmony import */ var _webfonts_fa_solid_900_woff2__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../webfonts/fa-solid-900.woff2 */ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2");
/* harmony import */ var _webfonts_fa_solid_900_ttf__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../webfonts/fa-solid-900.ttf */ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.ttf");
/* harmony import */ var _webfonts_fa_v4compatibility_woff2__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../webfonts/fa-v4compatibility.woff2 */ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-v4compatibility.woff2");
/* harmony import */ var _webfonts_fa_v4compatibility_ttf__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../webfonts/fa-v4compatibility.ttf */ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-v4compatibility.ttf");
// Imports










var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_webfonts_fa_brands_400_woff2__WEBPACK_IMPORTED_MODULE_2__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_webfonts_fa_brands_400_ttf__WEBPACK_IMPORTED_MODULE_3__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_2___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_webfonts_fa_regular_400_woff2__WEBPACK_IMPORTED_MODULE_4__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_3___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_webfonts_fa_regular_400_ttf__WEBPACK_IMPORTED_MODULE_5__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_4___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_webfonts_fa_solid_900_woff2__WEBPACK_IMPORTED_MODULE_6__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_5___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_webfonts_fa_solid_900_ttf__WEBPACK_IMPORTED_MODULE_7__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_6___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_webfonts_fa_v4compatibility_woff2__WEBPACK_IMPORTED_MODULE_8__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_7___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_webfonts_fa_v4compatibility_ttf__WEBPACK_IMPORTED_MODULE_9__["default"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/*!\n * Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com\n * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)\n * Copyright 2023 Fonticons, Inc.\n */\n.fa {\n  font-family: var(--fa-style-family, \"Font Awesome 6 Free\");\n  font-weight: var(--fa-style, 900); }\n\n.fa,\n.fa-classic,\n.fa-sharp,\n.fas,\n.fa-solid,\n.far,\n.fa-regular,\n.fab,\n.fa-brands {\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  display: var(--fa-display, inline-block);\n  font-style: normal;\n  font-variant: normal;\n  line-height: 1;\n  text-rendering: auto; }\n\n.fas,\n.fa-classic,\n.fa-solid,\n.far,\n.fa-regular {\n  font-family: 'Font Awesome 6 Free'; }\n\n.fab,\n.fa-brands {\n  font-family: 'Font Awesome 6 Brands'; }\n\n.fa-1x {\n  font-size: 1em; }\n\n.fa-2x {\n  font-size: 2em; }\n\n.fa-3x {\n  font-size: 3em; }\n\n.fa-4x {\n  font-size: 4em; }\n\n.fa-5x {\n  font-size: 5em; }\n\n.fa-6x {\n  font-size: 6em; }\n\n.fa-7x {\n  font-size: 7em; }\n\n.fa-8x {\n  font-size: 8em; }\n\n.fa-9x {\n  font-size: 9em; }\n\n.fa-10x {\n  font-size: 10em; }\n\n.fa-2xs {\n  font-size: 0.625em;\n  line-height: 0.1em;\n  vertical-align: 0.225em; }\n\n.fa-xs {\n  font-size: 0.75em;\n  line-height: 0.08333em;\n  vertical-align: 0.125em; }\n\n.fa-sm {\n  font-size: 0.875em;\n  line-height: 0.07143em;\n  vertical-align: 0.05357em; }\n\n.fa-lg {\n  font-size: 1.25em;\n  line-height: 0.05em;\n  vertical-align: -0.075em; }\n\n.fa-xl {\n  font-size: 1.5em;\n  line-height: 0.04167em;\n  vertical-align: -0.125em; }\n\n.fa-2xl {\n  font-size: 2em;\n  line-height: 0.03125em;\n  vertical-align: -0.1875em; }\n\n.fa-fw {\n  text-align: center;\n  width: 1.25em; }\n\n.fa-ul {\n  list-style-type: none;\n  margin-left: var(--fa-li-margin, 2.5em);\n  padding-left: 0; }\n  .fa-ul > li {\n    position: relative; }\n\n.fa-li {\n  left: calc(var(--fa-li-width, 2em) * -1);\n  position: absolute;\n  text-align: center;\n  width: var(--fa-li-width, 2em);\n  line-height: inherit; }\n\n.fa-border {\n  border-color: var(--fa-border-color, #eee);\n  border-radius: var(--fa-border-radius, 0.1em);\n  border-style: var(--fa-border-style, solid);\n  border-width: var(--fa-border-width, 0.08em);\n  padding: var(--fa-border-padding, 0.2em 0.25em 0.15em); }\n\n.fa-pull-left {\n  float: left;\n  margin-right: var(--fa-pull-margin, 0.3em); }\n\n.fa-pull-right {\n  float: right;\n  margin-left: var(--fa-pull-margin, 0.3em); }\n\n.fa-beat {\n  animation-name: fa-beat;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, ease-in-out); }\n\n.fa-bounce {\n  animation-name: fa-bounce;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1)); }\n\n.fa-fade {\n  animation-name: fa-fade;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1)); }\n\n.fa-beat-fade {\n  animation-name: fa-beat-fade;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1)); }\n\n.fa-flip {\n  animation-name: fa-flip;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, ease-in-out); }\n\n.fa-shake {\n  animation-name: fa-shake;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, linear); }\n\n.fa-spin {\n  animation-name: fa-spin;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 2s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, linear); }\n\n.fa-spin-reverse {\n  --fa-animation-direction: reverse; }\n\n.fa-pulse,\n.fa-spin-pulse {\n  animation-name: fa-spin;\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, steps(8)); }\n\n@media (prefers-reduced-motion: reduce) {\n  .fa-beat,\n  .fa-bounce,\n  .fa-fade,\n  .fa-beat-fade,\n  .fa-flip,\n  .fa-pulse,\n  .fa-shake,\n  .fa-spin,\n  .fa-spin-pulse {\n    animation-delay: -1ms;\n    animation-duration: 1ms;\n    animation-iteration-count: 1;\n    transition-delay: 0s;\n    transition-duration: 0s; } }\n\n@keyframes fa-beat {\n  0%, 90% {\n    transform: scale(1); }\n  45% {\n    transform: scale(var(--fa-beat-scale, 1.25)); } }\n\n@keyframes fa-bounce {\n  0% {\n    transform: scale(1, 1) translateY(0); }\n  10% {\n    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0); }\n  30% {\n    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em)); }\n  50% {\n    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0); }\n  57% {\n    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em)); }\n  64% {\n    transform: scale(1, 1) translateY(0); }\n  100% {\n    transform: scale(1, 1) translateY(0); } }\n\n@keyframes fa-fade {\n  50% {\n    opacity: var(--fa-fade-opacity, 0.4); } }\n\n@keyframes fa-beat-fade {\n  0%, 100% {\n    opacity: var(--fa-beat-fade-opacity, 0.4);\n    transform: scale(1); }\n  50% {\n    opacity: 1;\n    transform: scale(var(--fa-beat-fade-scale, 1.125)); } }\n\n@keyframes fa-flip {\n  50% {\n    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg)); } }\n\n@keyframes fa-shake {\n  0% {\n    transform: rotate(-15deg); }\n  4% {\n    transform: rotate(15deg); }\n  8%, 24% {\n    transform: rotate(-18deg); }\n  12%, 28% {\n    transform: rotate(18deg); }\n  16% {\n    transform: rotate(-22deg); }\n  20% {\n    transform: rotate(22deg); }\n  32% {\n    transform: rotate(-12deg); }\n  36% {\n    transform: rotate(12deg); }\n  40%, 100% {\n    transform: rotate(0deg); } }\n\n@keyframes fa-spin {\n  0% {\n    transform: rotate(0deg); }\n  100% {\n    transform: rotate(360deg); } }\n\n.fa-rotate-90 {\n  transform: rotate(90deg); }\n\n.fa-rotate-180 {\n  transform: rotate(180deg); }\n\n.fa-rotate-270 {\n  transform: rotate(270deg); }\n\n.fa-flip-horizontal {\n  transform: scale(-1, 1); }\n\n.fa-flip-vertical {\n  transform: scale(1, -1); }\n\n.fa-flip-both,\n.fa-flip-horizontal.fa-flip-vertical {\n  transform: scale(-1, -1); }\n\n.fa-rotate-by {\n  transform: rotate(var(--fa-rotate-angle, none)); }\n\n.fa-stack {\n  display: inline-block;\n  height: 2em;\n  line-height: 2em;\n  position: relative;\n  vertical-align: middle;\n  width: 2.5em; }\n\n.fa-stack-1x,\n.fa-stack-2x {\n  left: 0;\n  position: absolute;\n  text-align: center;\n  width: 100%;\n  z-index: var(--fa-stack-z-index, auto); }\n\n.fa-stack-1x {\n  line-height: inherit; }\n\n.fa-stack-2x {\n  font-size: 2em; }\n\n.fa-inverse {\n  color: var(--fa-inverse, #fff); }\n\n/* Font Awesome uses the Unicode Private Use Area (PUA) to ensure screen\nreaders do not read off random characters that represent icons */\n\n.fa-0::before {\n  content: \"\\30\"; }\n\n.fa-1::before {\n  content: \"\\31\"; }\n\n.fa-2::before {\n  content: \"\\32\"; }\n\n.fa-3::before {\n  content: \"\\33\"; }\n\n.fa-4::before {\n  content: \"\\34\"; }\n\n.fa-5::before {\n  content: \"\\35\"; }\n\n.fa-6::before {\n  content: \"\\36\"; }\n\n.fa-7::before {\n  content: \"\\37\"; }\n\n.fa-8::before {\n  content: \"\\38\"; }\n\n.fa-9::before {\n  content: \"\\39\"; }\n\n.fa-fill-drip::before {\n  content: \"\\f576\"; }\n\n.fa-arrows-to-circle::before {\n  content: \"\\e4bd\"; }\n\n.fa-circle-chevron-right::before {\n  content: \"\\f138\"; }\n\n.fa-chevron-circle-right::before {\n  content: \"\\f138\"; }\n\n.fa-at::before {\n  content: \"\\40\"; }\n\n.fa-trash-can::before {\n  content: \"\\f2ed\"; }\n\n.fa-trash-alt::before {\n  content: \"\\f2ed\"; }\n\n.fa-text-height::before {\n  content: \"\\f034\"; }\n\n.fa-user-xmark::before {\n  content: \"\\f235\"; }\n\n.fa-user-times::before {\n  content: \"\\f235\"; }\n\n.fa-stethoscope::before {\n  content: \"\\f0f1\"; }\n\n.fa-message::before {\n  content: \"\\f27a\"; }\n\n.fa-comment-alt::before {\n  content: \"\\f27a\"; }\n\n.fa-info::before {\n  content: \"\\f129\"; }\n\n.fa-down-left-and-up-right-to-center::before {\n  content: \"\\f422\"; }\n\n.fa-compress-alt::before {\n  content: \"\\f422\"; }\n\n.fa-explosion::before {\n  content: \"\\e4e9\"; }\n\n.fa-file-lines::before {\n  content: \"\\f15c\"; }\n\n.fa-file-alt::before {\n  content: \"\\f15c\"; }\n\n.fa-file-text::before {\n  content: \"\\f15c\"; }\n\n.fa-wave-square::before {\n  content: \"\\f83e\"; }\n\n.fa-ring::before {\n  content: \"\\f70b\"; }\n\n.fa-building-un::before {\n  content: \"\\e4d9\"; }\n\n.fa-dice-three::before {\n  content: \"\\f527\"; }\n\n.fa-calendar-days::before {\n  content: \"\\f073\"; }\n\n.fa-calendar-alt::before {\n  content: \"\\f073\"; }\n\n.fa-anchor-circle-check::before {\n  content: \"\\e4aa\"; }\n\n.fa-building-circle-arrow-right::before {\n  content: \"\\e4d1\"; }\n\n.fa-volleyball::before {\n  content: \"\\f45f\"; }\n\n.fa-volleyball-ball::before {\n  content: \"\\f45f\"; }\n\n.fa-arrows-up-to-line::before {\n  content: \"\\e4c2\"; }\n\n.fa-sort-down::before {\n  content: \"\\f0dd\"; }\n\n.fa-sort-desc::before {\n  content: \"\\f0dd\"; }\n\n.fa-circle-minus::before {\n  content: \"\\f056\"; }\n\n.fa-minus-circle::before {\n  content: \"\\f056\"; }\n\n.fa-door-open::before {\n  content: \"\\f52b\"; }\n\n.fa-right-from-bracket::before {\n  content: \"\\f2f5\"; }\n\n.fa-sign-out-alt::before {\n  content: \"\\f2f5\"; }\n\n.fa-atom::before {\n  content: \"\\f5d2\"; }\n\n.fa-soap::before {\n  content: \"\\e06e\"; }\n\n.fa-icons::before {\n  content: \"\\f86d\"; }\n\n.fa-heart-music-camera-bolt::before {\n  content: \"\\f86d\"; }\n\n.fa-microphone-lines-slash::before {\n  content: \"\\f539\"; }\n\n.fa-microphone-alt-slash::before {\n  content: \"\\f539\"; }\n\n.fa-bridge-circle-check::before {\n  content: \"\\e4c9\"; }\n\n.fa-pump-medical::before {\n  content: \"\\e06a\"; }\n\n.fa-fingerprint::before {\n  content: \"\\f577\"; }\n\n.fa-hand-point-right::before {\n  content: \"\\f0a4\"; }\n\n.fa-magnifying-glass-location::before {\n  content: \"\\f689\"; }\n\n.fa-search-location::before {\n  content: \"\\f689\"; }\n\n.fa-forward-step::before {\n  content: \"\\f051\"; }\n\n.fa-step-forward::before {\n  content: \"\\f051\"; }\n\n.fa-face-smile-beam::before {\n  content: \"\\f5b8\"; }\n\n.fa-smile-beam::before {\n  content: \"\\f5b8\"; }\n\n.fa-flag-checkered::before {\n  content: \"\\f11e\"; }\n\n.fa-football::before {\n  content: \"\\f44e\"; }\n\n.fa-football-ball::before {\n  content: \"\\f44e\"; }\n\n.fa-school-circle-exclamation::before {\n  content: \"\\e56c\"; }\n\n.fa-crop::before {\n  content: \"\\f125\"; }\n\n.fa-angles-down::before {\n  content: \"\\f103\"; }\n\n.fa-angle-double-down::before {\n  content: \"\\f103\"; }\n\n.fa-users-rectangle::before {\n  content: \"\\e594\"; }\n\n.fa-people-roof::before {\n  content: \"\\e537\"; }\n\n.fa-people-line::before {\n  content: \"\\e534\"; }\n\n.fa-beer-mug-empty::before {\n  content: \"\\f0fc\"; }\n\n.fa-beer::before {\n  content: \"\\f0fc\"; }\n\n.fa-diagram-predecessor::before {\n  content: \"\\e477\"; }\n\n.fa-arrow-up-long::before {\n  content: \"\\f176\"; }\n\n.fa-long-arrow-up::before {\n  content: \"\\f176\"; }\n\n.fa-fire-flame-simple::before {\n  content: \"\\f46a\"; }\n\n.fa-burn::before {\n  content: \"\\f46a\"; }\n\n.fa-person::before {\n  content: \"\\f183\"; }\n\n.fa-male::before {\n  content: \"\\f183\"; }\n\n.fa-laptop::before {\n  content: \"\\f109\"; }\n\n.fa-file-csv::before {\n  content: \"\\f6dd\"; }\n\n.fa-menorah::before {\n  content: \"\\f676\"; }\n\n.fa-truck-plane::before {\n  content: \"\\e58f\"; }\n\n.fa-record-vinyl::before {\n  content: \"\\f8d9\"; }\n\n.fa-face-grin-stars::before {\n  content: \"\\f587\"; }\n\n.fa-grin-stars::before {\n  content: \"\\f587\"; }\n\n.fa-bong::before {\n  content: \"\\f55c\"; }\n\n.fa-spaghetti-monster-flying::before {\n  content: \"\\f67b\"; }\n\n.fa-pastafarianism::before {\n  content: \"\\f67b\"; }\n\n.fa-arrow-down-up-across-line::before {\n  content: \"\\e4af\"; }\n\n.fa-spoon::before {\n  content: \"\\f2e5\"; }\n\n.fa-utensil-spoon::before {\n  content: \"\\f2e5\"; }\n\n.fa-jar-wheat::before {\n  content: \"\\e517\"; }\n\n.fa-envelopes-bulk::before {\n  content: \"\\f674\"; }\n\n.fa-mail-bulk::before {\n  content: \"\\f674\"; }\n\n.fa-file-circle-exclamation::before {\n  content: \"\\e4eb\"; }\n\n.fa-circle-h::before {\n  content: \"\\f47e\"; }\n\n.fa-hospital-symbol::before {\n  content: \"\\f47e\"; }\n\n.fa-pager::before {\n  content: \"\\f815\"; }\n\n.fa-address-book::before {\n  content: \"\\f2b9\"; }\n\n.fa-contact-book::before {\n  content: \"\\f2b9\"; }\n\n.fa-strikethrough::before {\n  content: \"\\f0cc\"; }\n\n.fa-k::before {\n  content: \"\\4b\"; }\n\n.fa-landmark-flag::before {\n  content: \"\\e51c\"; }\n\n.fa-pencil::before {\n  content: \"\\f303\"; }\n\n.fa-pencil-alt::before {\n  content: \"\\f303\"; }\n\n.fa-backward::before {\n  content: \"\\f04a\"; }\n\n.fa-caret-right::before {\n  content: \"\\f0da\"; }\n\n.fa-comments::before {\n  content: \"\\f086\"; }\n\n.fa-paste::before {\n  content: \"\\f0ea\"; }\n\n.fa-file-clipboard::before {\n  content: \"\\f0ea\"; }\n\n.fa-code-pull-request::before {\n  content: \"\\e13c\"; }\n\n.fa-clipboard-list::before {\n  content: \"\\f46d\"; }\n\n.fa-truck-ramp-box::before {\n  content: \"\\f4de\"; }\n\n.fa-truck-loading::before {\n  content: \"\\f4de\"; }\n\n.fa-user-check::before {\n  content: \"\\f4fc\"; }\n\n.fa-vial-virus::before {\n  content: \"\\e597\"; }\n\n.fa-sheet-plastic::before {\n  content: \"\\e571\"; }\n\n.fa-blog::before {\n  content: \"\\f781\"; }\n\n.fa-user-ninja::before {\n  content: \"\\f504\"; }\n\n.fa-person-arrow-up-from-line::before {\n  content: \"\\e539\"; }\n\n.fa-scroll-torah::before {\n  content: \"\\f6a0\"; }\n\n.fa-torah::before {\n  content: \"\\f6a0\"; }\n\n.fa-broom-ball::before {\n  content: \"\\f458\"; }\n\n.fa-quidditch::before {\n  content: \"\\f458\"; }\n\n.fa-quidditch-broom-ball::before {\n  content: \"\\f458\"; }\n\n.fa-toggle-off::before {\n  content: \"\\f204\"; }\n\n.fa-box-archive::before {\n  content: \"\\f187\"; }\n\n.fa-archive::before {\n  content: \"\\f187\"; }\n\n.fa-person-drowning::before {\n  content: \"\\e545\"; }\n\n.fa-arrow-down-9-1::before {\n  content: \"\\f886\"; }\n\n.fa-sort-numeric-desc::before {\n  content: \"\\f886\"; }\n\n.fa-sort-numeric-down-alt::before {\n  content: \"\\f886\"; }\n\n.fa-face-grin-tongue-squint::before {\n  content: \"\\f58a\"; }\n\n.fa-grin-tongue-squint::before {\n  content: \"\\f58a\"; }\n\n.fa-spray-can::before {\n  content: \"\\f5bd\"; }\n\n.fa-truck-monster::before {\n  content: \"\\f63b\"; }\n\n.fa-w::before {\n  content: \"\\57\"; }\n\n.fa-earth-africa::before {\n  content: \"\\f57c\"; }\n\n.fa-globe-africa::before {\n  content: \"\\f57c\"; }\n\n.fa-rainbow::before {\n  content: \"\\f75b\"; }\n\n.fa-circle-notch::before {\n  content: \"\\f1ce\"; }\n\n.fa-tablet-screen-button::before {\n  content: \"\\f3fa\"; }\n\n.fa-tablet-alt::before {\n  content: \"\\f3fa\"; }\n\n.fa-paw::before {\n  content: \"\\f1b0\"; }\n\n.fa-cloud::before {\n  content: \"\\f0c2\"; }\n\n.fa-trowel-bricks::before {\n  content: \"\\e58a\"; }\n\n.fa-face-flushed::before {\n  content: \"\\f579\"; }\n\n.fa-flushed::before {\n  content: \"\\f579\"; }\n\n.fa-hospital-user::before {\n  content: \"\\f80d\"; }\n\n.fa-tent-arrow-left-right::before {\n  content: \"\\e57f\"; }\n\n.fa-gavel::before {\n  content: \"\\f0e3\"; }\n\n.fa-legal::before {\n  content: \"\\f0e3\"; }\n\n.fa-binoculars::before {\n  content: \"\\f1e5\"; }\n\n.fa-microphone-slash::before {\n  content: \"\\f131\"; }\n\n.fa-box-tissue::before {\n  content: \"\\e05b\"; }\n\n.fa-motorcycle::before {\n  content: \"\\f21c\"; }\n\n.fa-bell-concierge::before {\n  content: \"\\f562\"; }\n\n.fa-concierge-bell::before {\n  content: \"\\f562\"; }\n\n.fa-pen-ruler::before {\n  content: \"\\f5ae\"; }\n\n.fa-pencil-ruler::before {\n  content: \"\\f5ae\"; }\n\n.fa-people-arrows::before {\n  content: \"\\e068\"; }\n\n.fa-people-arrows-left-right::before {\n  content: \"\\e068\"; }\n\n.fa-mars-and-venus-burst::before {\n  content: \"\\e523\"; }\n\n.fa-square-caret-right::before {\n  content: \"\\f152\"; }\n\n.fa-caret-square-right::before {\n  content: \"\\f152\"; }\n\n.fa-scissors::before {\n  content: \"\\f0c4\"; }\n\n.fa-cut::before {\n  content: \"\\f0c4\"; }\n\n.fa-sun-plant-wilt::before {\n  content: \"\\e57a\"; }\n\n.fa-toilets-portable::before {\n  content: \"\\e584\"; }\n\n.fa-hockey-puck::before {\n  content: \"\\f453\"; }\n\n.fa-table::before {\n  content: \"\\f0ce\"; }\n\n.fa-magnifying-glass-arrow-right::before {\n  content: \"\\e521\"; }\n\n.fa-tachograph-digital::before {\n  content: \"\\f566\"; }\n\n.fa-digital-tachograph::before {\n  content: \"\\f566\"; }\n\n.fa-users-slash::before {\n  content: \"\\e073\"; }\n\n.fa-clover::before {\n  content: \"\\e139\"; }\n\n.fa-reply::before {\n  content: \"\\f3e5\"; }\n\n.fa-mail-reply::before {\n  content: \"\\f3e5\"; }\n\n.fa-star-and-crescent::before {\n  content: \"\\f699\"; }\n\n.fa-house-fire::before {\n  content: \"\\e50c\"; }\n\n.fa-square-minus::before {\n  content: \"\\f146\"; }\n\n.fa-minus-square::before {\n  content: \"\\f146\"; }\n\n.fa-helicopter::before {\n  content: \"\\f533\"; }\n\n.fa-compass::before {\n  content: \"\\f14e\"; }\n\n.fa-square-caret-down::before {\n  content: \"\\f150\"; }\n\n.fa-caret-square-down::before {\n  content: \"\\f150\"; }\n\n.fa-file-circle-question::before {\n  content: \"\\e4ef\"; }\n\n.fa-laptop-code::before {\n  content: \"\\f5fc\"; }\n\n.fa-swatchbook::before {\n  content: \"\\f5c3\"; }\n\n.fa-prescription-bottle::before {\n  content: \"\\f485\"; }\n\n.fa-bars::before {\n  content: \"\\f0c9\"; }\n\n.fa-navicon::before {\n  content: \"\\f0c9\"; }\n\n.fa-people-group::before {\n  content: \"\\e533\"; }\n\n.fa-hourglass-end::before {\n  content: \"\\f253\"; }\n\n.fa-hourglass-3::before {\n  content: \"\\f253\"; }\n\n.fa-heart-crack::before {\n  content: \"\\f7a9\"; }\n\n.fa-heart-broken::before {\n  content: \"\\f7a9\"; }\n\n.fa-square-up-right::before {\n  content: \"\\f360\"; }\n\n.fa-external-link-square-alt::before {\n  content: \"\\f360\"; }\n\n.fa-face-kiss-beam::before {\n  content: \"\\f597\"; }\n\n.fa-kiss-beam::before {\n  content: \"\\f597\"; }\n\n.fa-film::before {\n  content: \"\\f008\"; }\n\n.fa-ruler-horizontal::before {\n  content: \"\\f547\"; }\n\n.fa-people-robbery::before {\n  content: \"\\e536\"; }\n\n.fa-lightbulb::before {\n  content: \"\\f0eb\"; }\n\n.fa-caret-left::before {\n  content: \"\\f0d9\"; }\n\n.fa-circle-exclamation::before {\n  content: \"\\f06a\"; }\n\n.fa-exclamation-circle::before {\n  content: \"\\f06a\"; }\n\n.fa-school-circle-xmark::before {\n  content: \"\\e56d\"; }\n\n.fa-arrow-right-from-bracket::before {\n  content: \"\\f08b\"; }\n\n.fa-sign-out::before {\n  content: \"\\f08b\"; }\n\n.fa-circle-chevron-down::before {\n  content: \"\\f13a\"; }\n\n.fa-chevron-circle-down::before {\n  content: \"\\f13a\"; }\n\n.fa-unlock-keyhole::before {\n  content: \"\\f13e\"; }\n\n.fa-unlock-alt::before {\n  content: \"\\f13e\"; }\n\n.fa-cloud-showers-heavy::before {\n  content: \"\\f740\"; }\n\n.fa-headphones-simple::before {\n  content: \"\\f58f\"; }\n\n.fa-headphones-alt::before {\n  content: \"\\f58f\"; }\n\n.fa-sitemap::before {\n  content: \"\\f0e8\"; }\n\n.fa-circle-dollar-to-slot::before {\n  content: \"\\f4b9\"; }\n\n.fa-donate::before {\n  content: \"\\f4b9\"; }\n\n.fa-memory::before {\n  content: \"\\f538\"; }\n\n.fa-road-spikes::before {\n  content: \"\\e568\"; }\n\n.fa-fire-burner::before {\n  content: \"\\e4f1\"; }\n\n.fa-flag::before {\n  content: \"\\f024\"; }\n\n.fa-hanukiah::before {\n  content: \"\\f6e6\"; }\n\n.fa-feather::before {\n  content: \"\\f52d\"; }\n\n.fa-volume-low::before {\n  content: \"\\f027\"; }\n\n.fa-volume-down::before {\n  content: \"\\f027\"; }\n\n.fa-comment-slash::before {\n  content: \"\\f4b3\"; }\n\n.fa-cloud-sun-rain::before {\n  content: \"\\f743\"; }\n\n.fa-compress::before {\n  content: \"\\f066\"; }\n\n.fa-wheat-awn::before {\n  content: \"\\e2cd\"; }\n\n.fa-wheat-alt::before {\n  content: \"\\e2cd\"; }\n\n.fa-ankh::before {\n  content: \"\\f644\"; }\n\n.fa-hands-holding-child::before {\n  content: \"\\e4fa\"; }\n\n.fa-asterisk::before {\n  content: \"\\2a\"; }\n\n.fa-square-check::before {\n  content: \"\\f14a\"; }\n\n.fa-check-square::before {\n  content: \"\\f14a\"; }\n\n.fa-peseta-sign::before {\n  content: \"\\e221\"; }\n\n.fa-heading::before {\n  content: \"\\f1dc\"; }\n\n.fa-header::before {\n  content: \"\\f1dc\"; }\n\n.fa-ghost::before {\n  content: \"\\f6e2\"; }\n\n.fa-list::before {\n  content: \"\\f03a\"; }\n\n.fa-list-squares::before {\n  content: \"\\f03a\"; }\n\n.fa-square-phone-flip::before {\n  content: \"\\f87b\"; }\n\n.fa-phone-square-alt::before {\n  content: \"\\f87b\"; }\n\n.fa-cart-plus::before {\n  content: \"\\f217\"; }\n\n.fa-gamepad::before {\n  content: \"\\f11b\"; }\n\n.fa-circle-dot::before {\n  content: \"\\f192\"; }\n\n.fa-dot-circle::before {\n  content: \"\\f192\"; }\n\n.fa-face-dizzy::before {\n  content: \"\\f567\"; }\n\n.fa-dizzy::before {\n  content: \"\\f567\"; }\n\n.fa-egg::before {\n  content: \"\\f7fb\"; }\n\n.fa-house-medical-circle-xmark::before {\n  content: \"\\e513\"; }\n\n.fa-campground::before {\n  content: \"\\f6bb\"; }\n\n.fa-folder-plus::before {\n  content: \"\\f65e\"; }\n\n.fa-futbol::before {\n  content: \"\\f1e3\"; }\n\n.fa-futbol-ball::before {\n  content: \"\\f1e3\"; }\n\n.fa-soccer-ball::before {\n  content: \"\\f1e3\"; }\n\n.fa-paintbrush::before {\n  content: \"\\f1fc\"; }\n\n.fa-paint-brush::before {\n  content: \"\\f1fc\"; }\n\n.fa-lock::before {\n  content: \"\\f023\"; }\n\n.fa-gas-pump::before {\n  content: \"\\f52f\"; }\n\n.fa-hot-tub-person::before {\n  content: \"\\f593\"; }\n\n.fa-hot-tub::before {\n  content: \"\\f593\"; }\n\n.fa-map-location::before {\n  content: \"\\f59f\"; }\n\n.fa-map-marked::before {\n  content: \"\\f59f\"; }\n\n.fa-house-flood-water::before {\n  content: \"\\e50e\"; }\n\n.fa-tree::before {\n  content: \"\\f1bb\"; }\n\n.fa-bridge-lock::before {\n  content: \"\\e4cc\"; }\n\n.fa-sack-dollar::before {\n  content: \"\\f81d\"; }\n\n.fa-pen-to-square::before {\n  content: \"\\f044\"; }\n\n.fa-edit::before {\n  content: \"\\f044\"; }\n\n.fa-car-side::before {\n  content: \"\\f5e4\"; }\n\n.fa-share-nodes::before {\n  content: \"\\f1e0\"; }\n\n.fa-share-alt::before {\n  content: \"\\f1e0\"; }\n\n.fa-heart-circle-minus::before {\n  content: \"\\e4ff\"; }\n\n.fa-hourglass-half::before {\n  content: \"\\f252\"; }\n\n.fa-hourglass-2::before {\n  content: \"\\f252\"; }\n\n.fa-microscope::before {\n  content: \"\\f610\"; }\n\n.fa-sink::before {\n  content: \"\\e06d\"; }\n\n.fa-bag-shopping::before {\n  content: \"\\f290\"; }\n\n.fa-shopping-bag::before {\n  content: \"\\f290\"; }\n\n.fa-arrow-down-z-a::before {\n  content: \"\\f881\"; }\n\n.fa-sort-alpha-desc::before {\n  content: \"\\f881\"; }\n\n.fa-sort-alpha-down-alt::before {\n  content: \"\\f881\"; }\n\n.fa-mitten::before {\n  content: \"\\f7b5\"; }\n\n.fa-person-rays::before {\n  content: \"\\e54d\"; }\n\n.fa-users::before {\n  content: \"\\f0c0\"; }\n\n.fa-eye-slash::before {\n  content: \"\\f070\"; }\n\n.fa-flask-vial::before {\n  content: \"\\e4f3\"; }\n\n.fa-hand::before {\n  content: \"\\f256\"; }\n\n.fa-hand-paper::before {\n  content: \"\\f256\"; }\n\n.fa-om::before {\n  content: \"\\f679\"; }\n\n.fa-worm::before {\n  content: \"\\e599\"; }\n\n.fa-house-circle-xmark::before {\n  content: \"\\e50b\"; }\n\n.fa-plug::before {\n  content: \"\\f1e6\"; }\n\n.fa-chevron-up::before {\n  content: \"\\f077\"; }\n\n.fa-hand-spock::before {\n  content: \"\\f259\"; }\n\n.fa-stopwatch::before {\n  content: \"\\f2f2\"; }\n\n.fa-face-kiss::before {\n  content: \"\\f596\"; }\n\n.fa-kiss::before {\n  content: \"\\f596\"; }\n\n.fa-bridge-circle-xmark::before {\n  content: \"\\e4cb\"; }\n\n.fa-face-grin-tongue::before {\n  content: \"\\f589\"; }\n\n.fa-grin-tongue::before {\n  content: \"\\f589\"; }\n\n.fa-chess-bishop::before {\n  content: \"\\f43a\"; }\n\n.fa-face-grin-wink::before {\n  content: \"\\f58c\"; }\n\n.fa-grin-wink::before {\n  content: \"\\f58c\"; }\n\n.fa-ear-deaf::before {\n  content: \"\\f2a4\"; }\n\n.fa-deaf::before {\n  content: \"\\f2a4\"; }\n\n.fa-deafness::before {\n  content: \"\\f2a4\"; }\n\n.fa-hard-of-hearing::before {\n  content: \"\\f2a4\"; }\n\n.fa-road-circle-check::before {\n  content: \"\\e564\"; }\n\n.fa-dice-five::before {\n  content: \"\\f523\"; }\n\n.fa-square-rss::before {\n  content: \"\\f143\"; }\n\n.fa-rss-square::before {\n  content: \"\\f143\"; }\n\n.fa-land-mine-on::before {\n  content: \"\\e51b\"; }\n\n.fa-i-cursor::before {\n  content: \"\\f246\"; }\n\n.fa-stamp::before {\n  content: \"\\f5bf\"; }\n\n.fa-stairs::before {\n  content: \"\\e289\"; }\n\n.fa-i::before {\n  content: \"\\49\"; }\n\n.fa-hryvnia-sign::before {\n  content: \"\\f6f2\"; }\n\n.fa-hryvnia::before {\n  content: \"\\f6f2\"; }\n\n.fa-pills::before {\n  content: \"\\f484\"; }\n\n.fa-face-grin-wide::before {\n  content: \"\\f581\"; }\n\n.fa-grin-alt::before {\n  content: \"\\f581\"; }\n\n.fa-tooth::before {\n  content: \"\\f5c9\"; }\n\n.fa-v::before {\n  content: \"\\56\"; }\n\n.fa-bangladeshi-taka-sign::before {\n  content: \"\\e2e6\"; }\n\n.fa-bicycle::before {\n  content: \"\\f206\"; }\n\n.fa-staff-snake::before {\n  content: \"\\e579\"; }\n\n.fa-rod-asclepius::before {\n  content: \"\\e579\"; }\n\n.fa-rod-snake::before {\n  content: \"\\e579\"; }\n\n.fa-staff-aesculapius::before {\n  content: \"\\e579\"; }\n\n.fa-head-side-cough-slash::before {\n  content: \"\\e062\"; }\n\n.fa-truck-medical::before {\n  content: \"\\f0f9\"; }\n\n.fa-ambulance::before {\n  content: \"\\f0f9\"; }\n\n.fa-wheat-awn-circle-exclamation::before {\n  content: \"\\e598\"; }\n\n.fa-snowman::before {\n  content: \"\\f7d0\"; }\n\n.fa-mortar-pestle::before {\n  content: \"\\f5a7\"; }\n\n.fa-road-barrier::before {\n  content: \"\\e562\"; }\n\n.fa-school::before {\n  content: \"\\f549\"; }\n\n.fa-igloo::before {\n  content: \"\\f7ae\"; }\n\n.fa-joint::before {\n  content: \"\\f595\"; }\n\n.fa-angle-right::before {\n  content: \"\\f105\"; }\n\n.fa-horse::before {\n  content: \"\\f6f0\"; }\n\n.fa-q::before {\n  content: \"\\51\"; }\n\n.fa-g::before {\n  content: \"\\47\"; }\n\n.fa-notes-medical::before {\n  content: \"\\f481\"; }\n\n.fa-temperature-half::before {\n  content: \"\\f2c9\"; }\n\n.fa-temperature-2::before {\n  content: \"\\f2c9\"; }\n\n.fa-thermometer-2::before {\n  content: \"\\f2c9\"; }\n\n.fa-thermometer-half::before {\n  content: \"\\f2c9\"; }\n\n.fa-dong-sign::before {\n  content: \"\\e169\"; }\n\n.fa-capsules::before {\n  content: \"\\f46b\"; }\n\n.fa-poo-storm::before {\n  content: \"\\f75a\"; }\n\n.fa-poo-bolt::before {\n  content: \"\\f75a\"; }\n\n.fa-face-frown-open::before {\n  content: \"\\f57a\"; }\n\n.fa-frown-open::before {\n  content: \"\\f57a\"; }\n\n.fa-hand-point-up::before {\n  content: \"\\f0a6\"; }\n\n.fa-money-bill::before {\n  content: \"\\f0d6\"; }\n\n.fa-bookmark::before {\n  content: \"\\f02e\"; }\n\n.fa-align-justify::before {\n  content: \"\\f039\"; }\n\n.fa-umbrella-beach::before {\n  content: \"\\f5ca\"; }\n\n.fa-helmet-un::before {\n  content: \"\\e503\"; }\n\n.fa-bullseye::before {\n  content: \"\\f140\"; }\n\n.fa-bacon::before {\n  content: \"\\f7e5\"; }\n\n.fa-hand-point-down::before {\n  content: \"\\f0a7\"; }\n\n.fa-arrow-up-from-bracket::before {\n  content: \"\\e09a\"; }\n\n.fa-folder::before {\n  content: \"\\f07b\"; }\n\n.fa-folder-blank::before {\n  content: \"\\f07b\"; }\n\n.fa-file-waveform::before {\n  content: \"\\f478\"; }\n\n.fa-file-medical-alt::before {\n  content: \"\\f478\"; }\n\n.fa-radiation::before {\n  content: \"\\f7b9\"; }\n\n.fa-chart-simple::before {\n  content: \"\\e473\"; }\n\n.fa-mars-stroke::before {\n  content: \"\\f229\"; }\n\n.fa-vial::before {\n  content: \"\\f492\"; }\n\n.fa-gauge::before {\n  content: \"\\f624\"; }\n\n.fa-dashboard::before {\n  content: \"\\f624\"; }\n\n.fa-gauge-med::before {\n  content: \"\\f624\"; }\n\n.fa-tachometer-alt-average::before {\n  content: \"\\f624\"; }\n\n.fa-wand-magic-sparkles::before {\n  content: \"\\e2ca\"; }\n\n.fa-magic-wand-sparkles::before {\n  content: \"\\e2ca\"; }\n\n.fa-e::before {\n  content: \"\\45\"; }\n\n.fa-pen-clip::before {\n  content: \"\\f305\"; }\n\n.fa-pen-alt::before {\n  content: \"\\f305\"; }\n\n.fa-bridge-circle-exclamation::before {\n  content: \"\\e4ca\"; }\n\n.fa-user::before {\n  content: \"\\f007\"; }\n\n.fa-school-circle-check::before {\n  content: \"\\e56b\"; }\n\n.fa-dumpster::before {\n  content: \"\\f793\"; }\n\n.fa-van-shuttle::before {\n  content: \"\\f5b6\"; }\n\n.fa-shuttle-van::before {\n  content: \"\\f5b6\"; }\n\n.fa-building-user::before {\n  content: \"\\e4da\"; }\n\n.fa-square-caret-left::before {\n  content: \"\\f191\"; }\n\n.fa-caret-square-left::before {\n  content: \"\\f191\"; }\n\n.fa-highlighter::before {\n  content: \"\\f591\"; }\n\n.fa-key::before {\n  content: \"\\f084\"; }\n\n.fa-bullhorn::before {\n  content: \"\\f0a1\"; }\n\n.fa-globe::before {\n  content: \"\\f0ac\"; }\n\n.fa-synagogue::before {\n  content: \"\\f69b\"; }\n\n.fa-person-half-dress::before {\n  content: \"\\e548\"; }\n\n.fa-road-bridge::before {\n  content: \"\\e563\"; }\n\n.fa-location-arrow::before {\n  content: \"\\f124\"; }\n\n.fa-c::before {\n  content: \"\\43\"; }\n\n.fa-tablet-button::before {\n  content: \"\\f10a\"; }\n\n.fa-building-lock::before {\n  content: \"\\e4d6\"; }\n\n.fa-pizza-slice::before {\n  content: \"\\f818\"; }\n\n.fa-money-bill-wave::before {\n  content: \"\\f53a\"; }\n\n.fa-chart-area::before {\n  content: \"\\f1fe\"; }\n\n.fa-area-chart::before {\n  content: \"\\f1fe\"; }\n\n.fa-house-flag::before {\n  content: \"\\e50d\"; }\n\n.fa-person-circle-minus::before {\n  content: \"\\e540\"; }\n\n.fa-ban::before {\n  content: \"\\f05e\"; }\n\n.fa-cancel::before {\n  content: \"\\f05e\"; }\n\n.fa-camera-rotate::before {\n  content: \"\\e0d8\"; }\n\n.fa-spray-can-sparkles::before {\n  content: \"\\f5d0\"; }\n\n.fa-air-freshener::before {\n  content: \"\\f5d0\"; }\n\n.fa-star::before {\n  content: \"\\f005\"; }\n\n.fa-repeat::before {\n  content: \"\\f363\"; }\n\n.fa-cross::before {\n  content: \"\\f654\"; }\n\n.fa-box::before {\n  content: \"\\f466\"; }\n\n.fa-venus-mars::before {\n  content: \"\\f228\"; }\n\n.fa-arrow-pointer::before {\n  content: \"\\f245\"; }\n\n.fa-mouse-pointer::before {\n  content: \"\\f245\"; }\n\n.fa-maximize::before {\n  content: \"\\f31e\"; }\n\n.fa-expand-arrows-alt::before {\n  content: \"\\f31e\"; }\n\n.fa-charging-station::before {\n  content: \"\\f5e7\"; }\n\n.fa-shapes::before {\n  content: \"\\f61f\"; }\n\n.fa-triangle-circle-square::before {\n  content: \"\\f61f\"; }\n\n.fa-shuffle::before {\n  content: \"\\f074\"; }\n\n.fa-random::before {\n  content: \"\\f074\"; }\n\n.fa-person-running::before {\n  content: \"\\f70c\"; }\n\n.fa-running::before {\n  content: \"\\f70c\"; }\n\n.fa-mobile-retro::before {\n  content: \"\\e527\"; }\n\n.fa-grip-lines-vertical::before {\n  content: \"\\f7a5\"; }\n\n.fa-spider::before {\n  content: \"\\f717\"; }\n\n.fa-hands-bound::before {\n  content: \"\\e4f9\"; }\n\n.fa-file-invoice-dollar::before {\n  content: \"\\f571\"; }\n\n.fa-plane-circle-exclamation::before {\n  content: \"\\e556\"; }\n\n.fa-x-ray::before {\n  content: \"\\f497\"; }\n\n.fa-spell-check::before {\n  content: \"\\f891\"; }\n\n.fa-slash::before {\n  content: \"\\f715\"; }\n\n.fa-computer-mouse::before {\n  content: \"\\f8cc\"; }\n\n.fa-mouse::before {\n  content: \"\\f8cc\"; }\n\n.fa-arrow-right-to-bracket::before {\n  content: \"\\f090\"; }\n\n.fa-sign-in::before {\n  content: \"\\f090\"; }\n\n.fa-shop-slash::before {\n  content: \"\\e070\"; }\n\n.fa-store-alt-slash::before {\n  content: \"\\e070\"; }\n\n.fa-server::before {\n  content: \"\\f233\"; }\n\n.fa-virus-covid-slash::before {\n  content: \"\\e4a9\"; }\n\n.fa-shop-lock::before {\n  content: \"\\e4a5\"; }\n\n.fa-hourglass-start::before {\n  content: \"\\f251\"; }\n\n.fa-hourglass-1::before {\n  content: \"\\f251\"; }\n\n.fa-blender-phone::before {\n  content: \"\\f6b6\"; }\n\n.fa-building-wheat::before {\n  content: \"\\e4db\"; }\n\n.fa-person-breastfeeding::before {\n  content: \"\\e53a\"; }\n\n.fa-right-to-bracket::before {\n  content: \"\\f2f6\"; }\n\n.fa-sign-in-alt::before {\n  content: \"\\f2f6\"; }\n\n.fa-venus::before {\n  content: \"\\f221\"; }\n\n.fa-passport::before {\n  content: \"\\f5ab\"; }\n\n.fa-heart-pulse::before {\n  content: \"\\f21e\"; }\n\n.fa-heartbeat::before {\n  content: \"\\f21e\"; }\n\n.fa-people-carry-box::before {\n  content: \"\\f4ce\"; }\n\n.fa-people-carry::before {\n  content: \"\\f4ce\"; }\n\n.fa-temperature-high::before {\n  content: \"\\f769\"; }\n\n.fa-microchip::before {\n  content: \"\\f2db\"; }\n\n.fa-crown::before {\n  content: \"\\f521\"; }\n\n.fa-weight-hanging::before {\n  content: \"\\f5cd\"; }\n\n.fa-xmarks-lines::before {\n  content: \"\\e59a\"; }\n\n.fa-file-prescription::before {\n  content: \"\\f572\"; }\n\n.fa-weight-scale::before {\n  content: \"\\f496\"; }\n\n.fa-weight::before {\n  content: \"\\f496\"; }\n\n.fa-user-group::before {\n  content: \"\\f500\"; }\n\n.fa-user-friends::before {\n  content: \"\\f500\"; }\n\n.fa-arrow-up-a-z::before {\n  content: \"\\f15e\"; }\n\n.fa-sort-alpha-up::before {\n  content: \"\\f15e\"; }\n\n.fa-chess-knight::before {\n  content: \"\\f441\"; }\n\n.fa-face-laugh-squint::before {\n  content: \"\\f59b\"; }\n\n.fa-laugh-squint::before {\n  content: \"\\f59b\"; }\n\n.fa-wheelchair::before {\n  content: \"\\f193\"; }\n\n.fa-circle-arrow-up::before {\n  content: \"\\f0aa\"; }\n\n.fa-arrow-circle-up::before {\n  content: \"\\f0aa\"; }\n\n.fa-toggle-on::before {\n  content: \"\\f205\"; }\n\n.fa-person-walking::before {\n  content: \"\\f554\"; }\n\n.fa-walking::before {\n  content: \"\\f554\"; }\n\n.fa-l::before {\n  content: \"\\4c\"; }\n\n.fa-fire::before {\n  content: \"\\f06d\"; }\n\n.fa-bed-pulse::before {\n  content: \"\\f487\"; }\n\n.fa-procedures::before {\n  content: \"\\f487\"; }\n\n.fa-shuttle-space::before {\n  content: \"\\f197\"; }\n\n.fa-space-shuttle::before {\n  content: \"\\f197\"; }\n\n.fa-face-laugh::before {\n  content: \"\\f599\"; }\n\n.fa-laugh::before {\n  content: \"\\f599\"; }\n\n.fa-folder-open::before {\n  content: \"\\f07c\"; }\n\n.fa-heart-circle-plus::before {\n  content: \"\\e500\"; }\n\n.fa-code-fork::before {\n  content: \"\\e13b\"; }\n\n.fa-city::before {\n  content: \"\\f64f\"; }\n\n.fa-microphone-lines::before {\n  content: \"\\f3c9\"; }\n\n.fa-microphone-alt::before {\n  content: \"\\f3c9\"; }\n\n.fa-pepper-hot::before {\n  content: \"\\f816\"; }\n\n.fa-unlock::before {\n  content: \"\\f09c\"; }\n\n.fa-colon-sign::before {\n  content: \"\\e140\"; }\n\n.fa-headset::before {\n  content: \"\\f590\"; }\n\n.fa-store-slash::before {\n  content: \"\\e071\"; }\n\n.fa-road-circle-xmark::before {\n  content: \"\\e566\"; }\n\n.fa-user-minus::before {\n  content: \"\\f503\"; }\n\n.fa-mars-stroke-up::before {\n  content: \"\\f22a\"; }\n\n.fa-mars-stroke-v::before {\n  content: \"\\f22a\"; }\n\n.fa-champagne-glasses::before {\n  content: \"\\f79f\"; }\n\n.fa-glass-cheers::before {\n  content: \"\\f79f\"; }\n\n.fa-clipboard::before {\n  content: \"\\f328\"; }\n\n.fa-house-circle-exclamation::before {\n  content: \"\\e50a\"; }\n\n.fa-file-arrow-up::before {\n  content: \"\\f574\"; }\n\n.fa-file-upload::before {\n  content: \"\\f574\"; }\n\n.fa-wifi::before {\n  content: \"\\f1eb\"; }\n\n.fa-wifi-3::before {\n  content: \"\\f1eb\"; }\n\n.fa-wifi-strong::before {\n  content: \"\\f1eb\"; }\n\n.fa-bath::before {\n  content: \"\\f2cd\"; }\n\n.fa-bathtub::before {\n  content: \"\\f2cd\"; }\n\n.fa-underline::before {\n  content: \"\\f0cd\"; }\n\n.fa-user-pen::before {\n  content: \"\\f4ff\"; }\n\n.fa-user-edit::before {\n  content: \"\\f4ff\"; }\n\n.fa-signature::before {\n  content: \"\\f5b7\"; }\n\n.fa-stroopwafel::before {\n  content: \"\\f551\"; }\n\n.fa-bold::before {\n  content: \"\\f032\"; }\n\n.fa-anchor-lock::before {\n  content: \"\\e4ad\"; }\n\n.fa-building-ngo::before {\n  content: \"\\e4d7\"; }\n\n.fa-manat-sign::before {\n  content: \"\\e1d5\"; }\n\n.fa-not-equal::before {\n  content: \"\\f53e\"; }\n\n.fa-border-top-left::before {\n  content: \"\\f853\"; }\n\n.fa-border-style::before {\n  content: \"\\f853\"; }\n\n.fa-map-location-dot::before {\n  content: \"\\f5a0\"; }\n\n.fa-map-marked-alt::before {\n  content: \"\\f5a0\"; }\n\n.fa-jedi::before {\n  content: \"\\f669\"; }\n\n.fa-square-poll-vertical::before {\n  content: \"\\f681\"; }\n\n.fa-poll::before {\n  content: \"\\f681\"; }\n\n.fa-mug-hot::before {\n  content: \"\\f7b6\"; }\n\n.fa-car-battery::before {\n  content: \"\\f5df\"; }\n\n.fa-battery-car::before {\n  content: \"\\f5df\"; }\n\n.fa-gift::before {\n  content: \"\\f06b\"; }\n\n.fa-dice-two::before {\n  content: \"\\f528\"; }\n\n.fa-chess-queen::before {\n  content: \"\\f445\"; }\n\n.fa-glasses::before {\n  content: \"\\f530\"; }\n\n.fa-chess-board::before {\n  content: \"\\f43c\"; }\n\n.fa-building-circle-check::before {\n  content: \"\\e4d2\"; }\n\n.fa-person-chalkboard::before {\n  content: \"\\e53d\"; }\n\n.fa-mars-stroke-right::before {\n  content: \"\\f22b\"; }\n\n.fa-mars-stroke-h::before {\n  content: \"\\f22b\"; }\n\n.fa-hand-back-fist::before {\n  content: \"\\f255\"; }\n\n.fa-hand-rock::before {\n  content: \"\\f255\"; }\n\n.fa-square-caret-up::before {\n  content: \"\\f151\"; }\n\n.fa-caret-square-up::before {\n  content: \"\\f151\"; }\n\n.fa-cloud-showers-water::before {\n  content: \"\\e4e4\"; }\n\n.fa-chart-bar::before {\n  content: \"\\f080\"; }\n\n.fa-bar-chart::before {\n  content: \"\\f080\"; }\n\n.fa-hands-bubbles::before {\n  content: \"\\e05e\"; }\n\n.fa-hands-wash::before {\n  content: \"\\e05e\"; }\n\n.fa-less-than-equal::before {\n  content: \"\\f537\"; }\n\n.fa-train::before {\n  content: \"\\f238\"; }\n\n.fa-eye-low-vision::before {\n  content: \"\\f2a8\"; }\n\n.fa-low-vision::before {\n  content: \"\\f2a8\"; }\n\n.fa-crow::before {\n  content: \"\\f520\"; }\n\n.fa-sailboat::before {\n  content: \"\\e445\"; }\n\n.fa-window-restore::before {\n  content: \"\\f2d2\"; }\n\n.fa-square-plus::before {\n  content: \"\\f0fe\"; }\n\n.fa-plus-square::before {\n  content: \"\\f0fe\"; }\n\n.fa-torii-gate::before {\n  content: \"\\f6a1\"; }\n\n.fa-frog::before {\n  content: \"\\f52e\"; }\n\n.fa-bucket::before {\n  content: \"\\e4cf\"; }\n\n.fa-image::before {\n  content: \"\\f03e\"; }\n\n.fa-microphone::before {\n  content: \"\\f130\"; }\n\n.fa-cow::before {\n  content: \"\\f6c8\"; }\n\n.fa-caret-up::before {\n  content: \"\\f0d8\"; }\n\n.fa-screwdriver::before {\n  content: \"\\f54a\"; }\n\n.fa-folder-closed::before {\n  content: \"\\e185\"; }\n\n.fa-house-tsunami::before {\n  content: \"\\e515\"; }\n\n.fa-square-nfi::before {\n  content: \"\\e576\"; }\n\n.fa-arrow-up-from-ground-water::before {\n  content: \"\\e4b5\"; }\n\n.fa-martini-glass::before {\n  content: \"\\f57b\"; }\n\n.fa-glass-martini-alt::before {\n  content: \"\\f57b\"; }\n\n.fa-rotate-left::before {\n  content: \"\\f2ea\"; }\n\n.fa-rotate-back::before {\n  content: \"\\f2ea\"; }\n\n.fa-rotate-backward::before {\n  content: \"\\f2ea\"; }\n\n.fa-undo-alt::before {\n  content: \"\\f2ea\"; }\n\n.fa-table-columns::before {\n  content: \"\\f0db\"; }\n\n.fa-columns::before {\n  content: \"\\f0db\"; }\n\n.fa-lemon::before {\n  content: \"\\f094\"; }\n\n.fa-head-side-mask::before {\n  content: \"\\e063\"; }\n\n.fa-handshake::before {\n  content: \"\\f2b5\"; }\n\n.fa-gem::before {\n  content: \"\\f3a5\"; }\n\n.fa-dolly::before {\n  content: \"\\f472\"; }\n\n.fa-dolly-box::before {\n  content: \"\\f472\"; }\n\n.fa-smoking::before {\n  content: \"\\f48d\"; }\n\n.fa-minimize::before {\n  content: \"\\f78c\"; }\n\n.fa-compress-arrows-alt::before {\n  content: \"\\f78c\"; }\n\n.fa-monument::before {\n  content: \"\\f5a6\"; }\n\n.fa-snowplow::before {\n  content: \"\\f7d2\"; }\n\n.fa-angles-right::before {\n  content: \"\\f101\"; }\n\n.fa-angle-double-right::before {\n  content: \"\\f101\"; }\n\n.fa-cannabis::before {\n  content: \"\\f55f\"; }\n\n.fa-circle-play::before {\n  content: \"\\f144\"; }\n\n.fa-play-circle::before {\n  content: \"\\f144\"; }\n\n.fa-tablets::before {\n  content: \"\\f490\"; }\n\n.fa-ethernet::before {\n  content: \"\\f796\"; }\n\n.fa-euro-sign::before {\n  content: \"\\f153\"; }\n\n.fa-eur::before {\n  content: \"\\f153\"; }\n\n.fa-euro::before {\n  content: \"\\f153\"; }\n\n.fa-chair::before {\n  content: \"\\f6c0\"; }\n\n.fa-circle-check::before {\n  content: \"\\f058\"; }\n\n.fa-check-circle::before {\n  content: \"\\f058\"; }\n\n.fa-circle-stop::before {\n  content: \"\\f28d\"; }\n\n.fa-stop-circle::before {\n  content: \"\\f28d\"; }\n\n.fa-compass-drafting::before {\n  content: \"\\f568\"; }\n\n.fa-drafting-compass::before {\n  content: \"\\f568\"; }\n\n.fa-plate-wheat::before {\n  content: \"\\e55a\"; }\n\n.fa-icicles::before {\n  content: \"\\f7ad\"; }\n\n.fa-person-shelter::before {\n  content: \"\\e54f\"; }\n\n.fa-neuter::before {\n  content: \"\\f22c\"; }\n\n.fa-id-badge::before {\n  content: \"\\f2c1\"; }\n\n.fa-marker::before {\n  content: \"\\f5a1\"; }\n\n.fa-face-laugh-beam::before {\n  content: \"\\f59a\"; }\n\n.fa-laugh-beam::before {\n  content: \"\\f59a\"; }\n\n.fa-helicopter-symbol::before {\n  content: \"\\e502\"; }\n\n.fa-universal-access::before {\n  content: \"\\f29a\"; }\n\n.fa-circle-chevron-up::before {\n  content: \"\\f139\"; }\n\n.fa-chevron-circle-up::before {\n  content: \"\\f139\"; }\n\n.fa-lari-sign::before {\n  content: \"\\e1c8\"; }\n\n.fa-volcano::before {\n  content: \"\\f770\"; }\n\n.fa-person-walking-dashed-line-arrow-right::before {\n  content: \"\\e553\"; }\n\n.fa-sterling-sign::before {\n  content: \"\\f154\"; }\n\n.fa-gbp::before {\n  content: \"\\f154\"; }\n\n.fa-pound-sign::before {\n  content: \"\\f154\"; }\n\n.fa-viruses::before {\n  content: \"\\e076\"; }\n\n.fa-square-person-confined::before {\n  content: \"\\e577\"; }\n\n.fa-user-tie::before {\n  content: \"\\f508\"; }\n\n.fa-arrow-down-long::before {\n  content: \"\\f175\"; }\n\n.fa-long-arrow-down::before {\n  content: \"\\f175\"; }\n\n.fa-tent-arrow-down-to-line::before {\n  content: \"\\e57e\"; }\n\n.fa-certificate::before {\n  content: \"\\f0a3\"; }\n\n.fa-reply-all::before {\n  content: \"\\f122\"; }\n\n.fa-mail-reply-all::before {\n  content: \"\\f122\"; }\n\n.fa-suitcase::before {\n  content: \"\\f0f2\"; }\n\n.fa-person-skating::before {\n  content: \"\\f7c5\"; }\n\n.fa-skating::before {\n  content: \"\\f7c5\"; }\n\n.fa-filter-circle-dollar::before {\n  content: \"\\f662\"; }\n\n.fa-funnel-dollar::before {\n  content: \"\\f662\"; }\n\n.fa-camera-retro::before {\n  content: \"\\f083\"; }\n\n.fa-circle-arrow-down::before {\n  content: \"\\f0ab\"; }\n\n.fa-arrow-circle-down::before {\n  content: \"\\f0ab\"; }\n\n.fa-file-import::before {\n  content: \"\\f56f\"; }\n\n.fa-arrow-right-to-file::before {\n  content: \"\\f56f\"; }\n\n.fa-square-arrow-up-right::before {\n  content: \"\\f14c\"; }\n\n.fa-external-link-square::before {\n  content: \"\\f14c\"; }\n\n.fa-box-open::before {\n  content: \"\\f49e\"; }\n\n.fa-scroll::before {\n  content: \"\\f70e\"; }\n\n.fa-spa::before {\n  content: \"\\f5bb\"; }\n\n.fa-location-pin-lock::before {\n  content: \"\\e51f\"; }\n\n.fa-pause::before {\n  content: \"\\f04c\"; }\n\n.fa-hill-avalanche::before {\n  content: \"\\e507\"; }\n\n.fa-temperature-empty::before {\n  content: \"\\f2cb\"; }\n\n.fa-temperature-0::before {\n  content: \"\\f2cb\"; }\n\n.fa-thermometer-0::before {\n  content: \"\\f2cb\"; }\n\n.fa-thermometer-empty::before {\n  content: \"\\f2cb\"; }\n\n.fa-bomb::before {\n  content: \"\\f1e2\"; }\n\n.fa-registered::before {\n  content: \"\\f25d\"; }\n\n.fa-address-card::before {\n  content: \"\\f2bb\"; }\n\n.fa-contact-card::before {\n  content: \"\\f2bb\"; }\n\n.fa-vcard::before {\n  content: \"\\f2bb\"; }\n\n.fa-scale-unbalanced-flip::before {\n  content: \"\\f516\"; }\n\n.fa-balance-scale-right::before {\n  content: \"\\f516\"; }\n\n.fa-subscript::before {\n  content: \"\\f12c\"; }\n\n.fa-diamond-turn-right::before {\n  content: \"\\f5eb\"; }\n\n.fa-directions::before {\n  content: \"\\f5eb\"; }\n\n.fa-burst::before {\n  content: \"\\e4dc\"; }\n\n.fa-house-laptop::before {\n  content: \"\\e066\"; }\n\n.fa-laptop-house::before {\n  content: \"\\e066\"; }\n\n.fa-face-tired::before {\n  content: \"\\f5c8\"; }\n\n.fa-tired::before {\n  content: \"\\f5c8\"; }\n\n.fa-money-bills::before {\n  content: \"\\e1f3\"; }\n\n.fa-smog::before {\n  content: \"\\f75f\"; }\n\n.fa-crutch::before {\n  content: \"\\f7f7\"; }\n\n.fa-cloud-arrow-up::before {\n  content: \"\\f0ee\"; }\n\n.fa-cloud-upload::before {\n  content: \"\\f0ee\"; }\n\n.fa-cloud-upload-alt::before {\n  content: \"\\f0ee\"; }\n\n.fa-palette::before {\n  content: \"\\f53f\"; }\n\n.fa-arrows-turn-right::before {\n  content: \"\\e4c0\"; }\n\n.fa-vest::before {\n  content: \"\\e085\"; }\n\n.fa-ferry::before {\n  content: \"\\e4ea\"; }\n\n.fa-arrows-down-to-people::before {\n  content: \"\\e4b9\"; }\n\n.fa-seedling::before {\n  content: \"\\f4d8\"; }\n\n.fa-sprout::before {\n  content: \"\\f4d8\"; }\n\n.fa-left-right::before {\n  content: \"\\f337\"; }\n\n.fa-arrows-alt-h::before {\n  content: \"\\f337\"; }\n\n.fa-boxes-packing::before {\n  content: \"\\e4c7\"; }\n\n.fa-circle-arrow-left::before {\n  content: \"\\f0a8\"; }\n\n.fa-arrow-circle-left::before {\n  content: \"\\f0a8\"; }\n\n.fa-group-arrows-rotate::before {\n  content: \"\\e4f6\"; }\n\n.fa-bowl-food::before {\n  content: \"\\e4c6\"; }\n\n.fa-candy-cane::before {\n  content: \"\\f786\"; }\n\n.fa-arrow-down-wide-short::before {\n  content: \"\\f160\"; }\n\n.fa-sort-amount-asc::before {\n  content: \"\\f160\"; }\n\n.fa-sort-amount-down::before {\n  content: \"\\f160\"; }\n\n.fa-cloud-bolt::before {\n  content: \"\\f76c\"; }\n\n.fa-thunderstorm::before {\n  content: \"\\f76c\"; }\n\n.fa-text-slash::before {\n  content: \"\\f87d\"; }\n\n.fa-remove-format::before {\n  content: \"\\f87d\"; }\n\n.fa-face-smile-wink::before {\n  content: \"\\f4da\"; }\n\n.fa-smile-wink::before {\n  content: \"\\f4da\"; }\n\n.fa-file-word::before {\n  content: \"\\f1c2\"; }\n\n.fa-file-powerpoint::before {\n  content: \"\\f1c4\"; }\n\n.fa-arrows-left-right::before {\n  content: \"\\f07e\"; }\n\n.fa-arrows-h::before {\n  content: \"\\f07e\"; }\n\n.fa-house-lock::before {\n  content: \"\\e510\"; }\n\n.fa-cloud-arrow-down::before {\n  content: \"\\f0ed\"; }\n\n.fa-cloud-download::before {\n  content: \"\\f0ed\"; }\n\n.fa-cloud-download-alt::before {\n  content: \"\\f0ed\"; }\n\n.fa-children::before {\n  content: \"\\e4e1\"; }\n\n.fa-chalkboard::before {\n  content: \"\\f51b\"; }\n\n.fa-blackboard::before {\n  content: \"\\f51b\"; }\n\n.fa-user-large-slash::before {\n  content: \"\\f4fa\"; }\n\n.fa-user-alt-slash::before {\n  content: \"\\f4fa\"; }\n\n.fa-envelope-open::before {\n  content: \"\\f2b6\"; }\n\n.fa-handshake-simple-slash::before {\n  content: \"\\e05f\"; }\n\n.fa-handshake-alt-slash::before {\n  content: \"\\e05f\"; }\n\n.fa-mattress-pillow::before {\n  content: \"\\e525\"; }\n\n.fa-guarani-sign::before {\n  content: \"\\e19a\"; }\n\n.fa-arrows-rotate::before {\n  content: \"\\f021\"; }\n\n.fa-refresh::before {\n  content: \"\\f021\"; }\n\n.fa-sync::before {\n  content: \"\\f021\"; }\n\n.fa-fire-extinguisher::before {\n  content: \"\\f134\"; }\n\n.fa-cruzeiro-sign::before {\n  content: \"\\e152\"; }\n\n.fa-greater-than-equal::before {\n  content: \"\\f532\"; }\n\n.fa-shield-halved::before {\n  content: \"\\f3ed\"; }\n\n.fa-shield-alt::before {\n  content: \"\\f3ed\"; }\n\n.fa-book-atlas::before {\n  content: \"\\f558\"; }\n\n.fa-atlas::before {\n  content: \"\\f558\"; }\n\n.fa-virus::before {\n  content: \"\\e074\"; }\n\n.fa-envelope-circle-check::before {\n  content: \"\\e4e8\"; }\n\n.fa-layer-group::before {\n  content: \"\\f5fd\"; }\n\n.fa-arrows-to-dot::before {\n  content: \"\\e4be\"; }\n\n.fa-archway::before {\n  content: \"\\f557\"; }\n\n.fa-heart-circle-check::before {\n  content: \"\\e4fd\"; }\n\n.fa-house-chimney-crack::before {\n  content: \"\\f6f1\"; }\n\n.fa-house-damage::before {\n  content: \"\\f6f1\"; }\n\n.fa-file-zipper::before {\n  content: \"\\f1c6\"; }\n\n.fa-file-archive::before {\n  content: \"\\f1c6\"; }\n\n.fa-square::before {\n  content: \"\\f0c8\"; }\n\n.fa-martini-glass-empty::before {\n  content: \"\\f000\"; }\n\n.fa-glass-martini::before {\n  content: \"\\f000\"; }\n\n.fa-couch::before {\n  content: \"\\f4b8\"; }\n\n.fa-cedi-sign::before {\n  content: \"\\e0df\"; }\n\n.fa-italic::before {\n  content: \"\\f033\"; }\n\n.fa-church::before {\n  content: \"\\f51d\"; }\n\n.fa-comments-dollar::before {\n  content: \"\\f653\"; }\n\n.fa-democrat::before {\n  content: \"\\f747\"; }\n\n.fa-z::before {\n  content: \"\\5a\"; }\n\n.fa-person-skiing::before {\n  content: \"\\f7c9\"; }\n\n.fa-skiing::before {\n  content: \"\\f7c9\"; }\n\n.fa-road-lock::before {\n  content: \"\\e567\"; }\n\n.fa-a::before {\n  content: \"\\41\"; }\n\n.fa-temperature-arrow-down::before {\n  content: \"\\e03f\"; }\n\n.fa-temperature-down::before {\n  content: \"\\e03f\"; }\n\n.fa-feather-pointed::before {\n  content: \"\\f56b\"; }\n\n.fa-feather-alt::before {\n  content: \"\\f56b\"; }\n\n.fa-p::before {\n  content: \"\\50\"; }\n\n.fa-snowflake::before {\n  content: \"\\f2dc\"; }\n\n.fa-newspaper::before {\n  content: \"\\f1ea\"; }\n\n.fa-rectangle-ad::before {\n  content: \"\\f641\"; }\n\n.fa-ad::before {\n  content: \"\\f641\"; }\n\n.fa-circle-arrow-right::before {\n  content: \"\\f0a9\"; }\n\n.fa-arrow-circle-right::before {\n  content: \"\\f0a9\"; }\n\n.fa-filter-circle-xmark::before {\n  content: \"\\e17b\"; }\n\n.fa-locust::before {\n  content: \"\\e520\"; }\n\n.fa-sort::before {\n  content: \"\\f0dc\"; }\n\n.fa-unsorted::before {\n  content: \"\\f0dc\"; }\n\n.fa-list-ol::before {\n  content: \"\\f0cb\"; }\n\n.fa-list-1-2::before {\n  content: \"\\f0cb\"; }\n\n.fa-list-numeric::before {\n  content: \"\\f0cb\"; }\n\n.fa-person-dress-burst::before {\n  content: \"\\e544\"; }\n\n.fa-money-check-dollar::before {\n  content: \"\\f53d\"; }\n\n.fa-money-check-alt::before {\n  content: \"\\f53d\"; }\n\n.fa-vector-square::before {\n  content: \"\\f5cb\"; }\n\n.fa-bread-slice::before {\n  content: \"\\f7ec\"; }\n\n.fa-language::before {\n  content: \"\\f1ab\"; }\n\n.fa-face-kiss-wink-heart::before {\n  content: \"\\f598\"; }\n\n.fa-kiss-wink-heart::before {\n  content: \"\\f598\"; }\n\n.fa-filter::before {\n  content: \"\\f0b0\"; }\n\n.fa-question::before {\n  content: \"\\3f\"; }\n\n.fa-file-signature::before {\n  content: \"\\f573\"; }\n\n.fa-up-down-left-right::before {\n  content: \"\\f0b2\"; }\n\n.fa-arrows-alt::before {\n  content: \"\\f0b2\"; }\n\n.fa-house-chimney-user::before {\n  content: \"\\e065\"; }\n\n.fa-hand-holding-heart::before {\n  content: \"\\f4be\"; }\n\n.fa-puzzle-piece::before {\n  content: \"\\f12e\"; }\n\n.fa-money-check::before {\n  content: \"\\f53c\"; }\n\n.fa-star-half-stroke::before {\n  content: \"\\f5c0\"; }\n\n.fa-star-half-alt::before {\n  content: \"\\f5c0\"; }\n\n.fa-code::before {\n  content: \"\\f121\"; }\n\n.fa-whiskey-glass::before {\n  content: \"\\f7a0\"; }\n\n.fa-glass-whiskey::before {\n  content: \"\\f7a0\"; }\n\n.fa-building-circle-exclamation::before {\n  content: \"\\e4d3\"; }\n\n.fa-magnifying-glass-chart::before {\n  content: \"\\e522\"; }\n\n.fa-arrow-up-right-from-square::before {\n  content: \"\\f08e\"; }\n\n.fa-external-link::before {\n  content: \"\\f08e\"; }\n\n.fa-cubes-stacked::before {\n  content: \"\\e4e6\"; }\n\n.fa-won-sign::before {\n  content: \"\\f159\"; }\n\n.fa-krw::before {\n  content: \"\\f159\"; }\n\n.fa-won::before {\n  content: \"\\f159\"; }\n\n.fa-virus-covid::before {\n  content: \"\\e4a8\"; }\n\n.fa-austral-sign::before {\n  content: \"\\e0a9\"; }\n\n.fa-f::before {\n  content: \"\\46\"; }\n\n.fa-leaf::before {\n  content: \"\\f06c\"; }\n\n.fa-road::before {\n  content: \"\\f018\"; }\n\n.fa-taxi::before {\n  content: \"\\f1ba\"; }\n\n.fa-cab::before {\n  content: \"\\f1ba\"; }\n\n.fa-person-circle-plus::before {\n  content: \"\\e541\"; }\n\n.fa-chart-pie::before {\n  content: \"\\f200\"; }\n\n.fa-pie-chart::before {\n  content: \"\\f200\"; }\n\n.fa-bolt-lightning::before {\n  content: \"\\e0b7\"; }\n\n.fa-sack-xmark::before {\n  content: \"\\e56a\"; }\n\n.fa-file-excel::before {\n  content: \"\\f1c3\"; }\n\n.fa-file-contract::before {\n  content: \"\\f56c\"; }\n\n.fa-fish-fins::before {\n  content: \"\\e4f2\"; }\n\n.fa-building-flag::before {\n  content: \"\\e4d5\"; }\n\n.fa-face-grin-beam::before {\n  content: \"\\f582\"; }\n\n.fa-grin-beam::before {\n  content: \"\\f582\"; }\n\n.fa-object-ungroup::before {\n  content: \"\\f248\"; }\n\n.fa-poop::before {\n  content: \"\\f619\"; }\n\n.fa-location-pin::before {\n  content: \"\\f041\"; }\n\n.fa-map-marker::before {\n  content: \"\\f041\"; }\n\n.fa-kaaba::before {\n  content: \"\\f66b\"; }\n\n.fa-toilet-paper::before {\n  content: \"\\f71e\"; }\n\n.fa-helmet-safety::before {\n  content: \"\\f807\"; }\n\n.fa-hard-hat::before {\n  content: \"\\f807\"; }\n\n.fa-hat-hard::before {\n  content: \"\\f807\"; }\n\n.fa-eject::before {\n  content: \"\\f052\"; }\n\n.fa-circle-right::before {\n  content: \"\\f35a\"; }\n\n.fa-arrow-alt-circle-right::before {\n  content: \"\\f35a\"; }\n\n.fa-plane-circle-check::before {\n  content: \"\\e555\"; }\n\n.fa-face-rolling-eyes::before {\n  content: \"\\f5a5\"; }\n\n.fa-meh-rolling-eyes::before {\n  content: \"\\f5a5\"; }\n\n.fa-object-group::before {\n  content: \"\\f247\"; }\n\n.fa-chart-line::before {\n  content: \"\\f201\"; }\n\n.fa-line-chart::before {\n  content: \"\\f201\"; }\n\n.fa-mask-ventilator::before {\n  content: \"\\e524\"; }\n\n.fa-arrow-right::before {\n  content: \"\\f061\"; }\n\n.fa-signs-post::before {\n  content: \"\\f277\"; }\n\n.fa-map-signs::before {\n  content: \"\\f277\"; }\n\n.fa-cash-register::before {\n  content: \"\\f788\"; }\n\n.fa-person-circle-question::before {\n  content: \"\\e542\"; }\n\n.fa-h::before {\n  content: \"\\48\"; }\n\n.fa-tarp::before {\n  content: \"\\e57b\"; }\n\n.fa-screwdriver-wrench::before {\n  content: \"\\f7d9\"; }\n\n.fa-tools::before {\n  content: \"\\f7d9\"; }\n\n.fa-arrows-to-eye::before {\n  content: \"\\e4bf\"; }\n\n.fa-plug-circle-bolt::before {\n  content: \"\\e55b\"; }\n\n.fa-heart::before {\n  content: \"\\f004\"; }\n\n.fa-mars-and-venus::before {\n  content: \"\\f224\"; }\n\n.fa-house-user::before {\n  content: \"\\e1b0\"; }\n\n.fa-home-user::before {\n  content: \"\\e1b0\"; }\n\n.fa-dumpster-fire::before {\n  content: \"\\f794\"; }\n\n.fa-house-crack::before {\n  content: \"\\e3b1\"; }\n\n.fa-martini-glass-citrus::before {\n  content: \"\\f561\"; }\n\n.fa-cocktail::before {\n  content: \"\\f561\"; }\n\n.fa-face-surprise::before {\n  content: \"\\f5c2\"; }\n\n.fa-surprise::before {\n  content: \"\\f5c2\"; }\n\n.fa-bottle-water::before {\n  content: \"\\e4c5\"; }\n\n.fa-circle-pause::before {\n  content: \"\\f28b\"; }\n\n.fa-pause-circle::before {\n  content: \"\\f28b\"; }\n\n.fa-toilet-paper-slash::before {\n  content: \"\\e072\"; }\n\n.fa-apple-whole::before {\n  content: \"\\f5d1\"; }\n\n.fa-apple-alt::before {\n  content: \"\\f5d1\"; }\n\n.fa-kitchen-set::before {\n  content: \"\\e51a\"; }\n\n.fa-r::before {\n  content: \"\\52\"; }\n\n.fa-temperature-quarter::before {\n  content: \"\\f2ca\"; }\n\n.fa-temperature-1::before {\n  content: \"\\f2ca\"; }\n\n.fa-thermometer-1::before {\n  content: \"\\f2ca\"; }\n\n.fa-thermometer-quarter::before {\n  content: \"\\f2ca\"; }\n\n.fa-cube::before {\n  content: \"\\f1b2\"; }\n\n.fa-bitcoin-sign::before {\n  content: \"\\e0b4\"; }\n\n.fa-shield-dog::before {\n  content: \"\\e573\"; }\n\n.fa-solar-panel::before {\n  content: \"\\f5ba\"; }\n\n.fa-lock-open::before {\n  content: \"\\f3c1\"; }\n\n.fa-elevator::before {\n  content: \"\\e16d\"; }\n\n.fa-money-bill-transfer::before {\n  content: \"\\e528\"; }\n\n.fa-money-bill-trend-up::before {\n  content: \"\\e529\"; }\n\n.fa-house-flood-water-circle-arrow-right::before {\n  content: \"\\e50f\"; }\n\n.fa-square-poll-horizontal::before {\n  content: \"\\f682\"; }\n\n.fa-poll-h::before {\n  content: \"\\f682\"; }\n\n.fa-circle::before {\n  content: \"\\f111\"; }\n\n.fa-backward-fast::before {\n  content: \"\\f049\"; }\n\n.fa-fast-backward::before {\n  content: \"\\f049\"; }\n\n.fa-recycle::before {\n  content: \"\\f1b8\"; }\n\n.fa-user-astronaut::before {\n  content: \"\\f4fb\"; }\n\n.fa-plane-slash::before {\n  content: \"\\e069\"; }\n\n.fa-trademark::before {\n  content: \"\\f25c\"; }\n\n.fa-basketball::before {\n  content: \"\\f434\"; }\n\n.fa-basketball-ball::before {\n  content: \"\\f434\"; }\n\n.fa-satellite-dish::before {\n  content: \"\\f7c0\"; }\n\n.fa-circle-up::before {\n  content: \"\\f35b\"; }\n\n.fa-arrow-alt-circle-up::before {\n  content: \"\\f35b\"; }\n\n.fa-mobile-screen-button::before {\n  content: \"\\f3cd\"; }\n\n.fa-mobile-alt::before {\n  content: \"\\f3cd\"; }\n\n.fa-volume-high::before {\n  content: \"\\f028\"; }\n\n.fa-volume-up::before {\n  content: \"\\f028\"; }\n\n.fa-users-rays::before {\n  content: \"\\e593\"; }\n\n.fa-wallet::before {\n  content: \"\\f555\"; }\n\n.fa-clipboard-check::before {\n  content: \"\\f46c\"; }\n\n.fa-file-audio::before {\n  content: \"\\f1c7\"; }\n\n.fa-burger::before {\n  content: \"\\f805\"; }\n\n.fa-hamburger::before {\n  content: \"\\f805\"; }\n\n.fa-wrench::before {\n  content: \"\\f0ad\"; }\n\n.fa-bugs::before {\n  content: \"\\e4d0\"; }\n\n.fa-rupee-sign::before {\n  content: \"\\f156\"; }\n\n.fa-rupee::before {\n  content: \"\\f156\"; }\n\n.fa-file-image::before {\n  content: \"\\f1c5\"; }\n\n.fa-circle-question::before {\n  content: \"\\f059\"; }\n\n.fa-question-circle::before {\n  content: \"\\f059\"; }\n\n.fa-plane-departure::before {\n  content: \"\\f5b0\"; }\n\n.fa-handshake-slash::before {\n  content: \"\\e060\"; }\n\n.fa-book-bookmark::before {\n  content: \"\\e0bb\"; }\n\n.fa-code-branch::before {\n  content: \"\\f126\"; }\n\n.fa-hat-cowboy::before {\n  content: \"\\f8c0\"; }\n\n.fa-bridge::before {\n  content: \"\\e4c8\"; }\n\n.fa-phone-flip::before {\n  content: \"\\f879\"; }\n\n.fa-phone-alt::before {\n  content: \"\\f879\"; }\n\n.fa-truck-front::before {\n  content: \"\\e2b7\"; }\n\n.fa-cat::before {\n  content: \"\\f6be\"; }\n\n.fa-anchor-circle-exclamation::before {\n  content: \"\\e4ab\"; }\n\n.fa-truck-field::before {\n  content: \"\\e58d\"; }\n\n.fa-route::before {\n  content: \"\\f4d7\"; }\n\n.fa-clipboard-question::before {\n  content: \"\\e4e3\"; }\n\n.fa-panorama::before {\n  content: \"\\e209\"; }\n\n.fa-comment-medical::before {\n  content: \"\\f7f5\"; }\n\n.fa-teeth-open::before {\n  content: \"\\f62f\"; }\n\n.fa-file-circle-minus::before {\n  content: \"\\e4ed\"; }\n\n.fa-tags::before {\n  content: \"\\f02c\"; }\n\n.fa-wine-glass::before {\n  content: \"\\f4e3\"; }\n\n.fa-forward-fast::before {\n  content: \"\\f050\"; }\n\n.fa-fast-forward::before {\n  content: \"\\f050\"; }\n\n.fa-face-meh-blank::before {\n  content: \"\\f5a4\"; }\n\n.fa-meh-blank::before {\n  content: \"\\f5a4\"; }\n\n.fa-square-parking::before {\n  content: \"\\f540\"; }\n\n.fa-parking::before {\n  content: \"\\f540\"; }\n\n.fa-house-signal::before {\n  content: \"\\e012\"; }\n\n.fa-bars-progress::before {\n  content: \"\\f828\"; }\n\n.fa-tasks-alt::before {\n  content: \"\\f828\"; }\n\n.fa-faucet-drip::before {\n  content: \"\\e006\"; }\n\n.fa-cart-flatbed::before {\n  content: \"\\f474\"; }\n\n.fa-dolly-flatbed::before {\n  content: \"\\f474\"; }\n\n.fa-ban-smoking::before {\n  content: \"\\f54d\"; }\n\n.fa-smoking-ban::before {\n  content: \"\\f54d\"; }\n\n.fa-terminal::before {\n  content: \"\\f120\"; }\n\n.fa-mobile-button::before {\n  content: \"\\f10b\"; }\n\n.fa-house-medical-flag::before {\n  content: \"\\e514\"; }\n\n.fa-basket-shopping::before {\n  content: \"\\f291\"; }\n\n.fa-shopping-basket::before {\n  content: \"\\f291\"; }\n\n.fa-tape::before {\n  content: \"\\f4db\"; }\n\n.fa-bus-simple::before {\n  content: \"\\f55e\"; }\n\n.fa-bus-alt::before {\n  content: \"\\f55e\"; }\n\n.fa-eye::before {\n  content: \"\\f06e\"; }\n\n.fa-face-sad-cry::before {\n  content: \"\\f5b3\"; }\n\n.fa-sad-cry::before {\n  content: \"\\f5b3\"; }\n\n.fa-audio-description::before {\n  content: \"\\f29e\"; }\n\n.fa-person-military-to-person::before {\n  content: \"\\e54c\"; }\n\n.fa-file-shield::before {\n  content: \"\\e4f0\"; }\n\n.fa-user-slash::before {\n  content: \"\\f506\"; }\n\n.fa-pen::before {\n  content: \"\\f304\"; }\n\n.fa-tower-observation::before {\n  content: \"\\e586\"; }\n\n.fa-file-code::before {\n  content: \"\\f1c9\"; }\n\n.fa-signal::before {\n  content: \"\\f012\"; }\n\n.fa-signal-5::before {\n  content: \"\\f012\"; }\n\n.fa-signal-perfect::before {\n  content: \"\\f012\"; }\n\n.fa-bus::before {\n  content: \"\\f207\"; }\n\n.fa-heart-circle-xmark::before {\n  content: \"\\e501\"; }\n\n.fa-house-chimney::before {\n  content: \"\\e3af\"; }\n\n.fa-home-lg::before {\n  content: \"\\e3af\"; }\n\n.fa-window-maximize::before {\n  content: \"\\f2d0\"; }\n\n.fa-face-frown::before {\n  content: \"\\f119\"; }\n\n.fa-frown::before {\n  content: \"\\f119\"; }\n\n.fa-prescription::before {\n  content: \"\\f5b1\"; }\n\n.fa-shop::before {\n  content: \"\\f54f\"; }\n\n.fa-store-alt::before {\n  content: \"\\f54f\"; }\n\n.fa-floppy-disk::before {\n  content: \"\\f0c7\"; }\n\n.fa-save::before {\n  content: \"\\f0c7\"; }\n\n.fa-vihara::before {\n  content: \"\\f6a7\"; }\n\n.fa-scale-unbalanced::before {\n  content: \"\\f515\"; }\n\n.fa-balance-scale-left::before {\n  content: \"\\f515\"; }\n\n.fa-sort-up::before {\n  content: \"\\f0de\"; }\n\n.fa-sort-asc::before {\n  content: \"\\f0de\"; }\n\n.fa-comment-dots::before {\n  content: \"\\f4ad\"; }\n\n.fa-commenting::before {\n  content: \"\\f4ad\"; }\n\n.fa-plant-wilt::before {\n  content: \"\\e5aa\"; }\n\n.fa-diamond::before {\n  content: \"\\f219\"; }\n\n.fa-face-grin-squint::before {\n  content: \"\\f585\"; }\n\n.fa-grin-squint::before {\n  content: \"\\f585\"; }\n\n.fa-hand-holding-dollar::before {\n  content: \"\\f4c0\"; }\n\n.fa-hand-holding-usd::before {\n  content: \"\\f4c0\"; }\n\n.fa-bacterium::before {\n  content: \"\\e05a\"; }\n\n.fa-hand-pointer::before {\n  content: \"\\f25a\"; }\n\n.fa-drum-steelpan::before {\n  content: \"\\f56a\"; }\n\n.fa-hand-scissors::before {\n  content: \"\\f257\"; }\n\n.fa-hands-praying::before {\n  content: \"\\f684\"; }\n\n.fa-praying-hands::before {\n  content: \"\\f684\"; }\n\n.fa-arrow-rotate-right::before {\n  content: \"\\f01e\"; }\n\n.fa-arrow-right-rotate::before {\n  content: \"\\f01e\"; }\n\n.fa-arrow-rotate-forward::before {\n  content: \"\\f01e\"; }\n\n.fa-redo::before {\n  content: \"\\f01e\"; }\n\n.fa-biohazard::before {\n  content: \"\\f780\"; }\n\n.fa-location-crosshairs::before {\n  content: \"\\f601\"; }\n\n.fa-location::before {\n  content: \"\\f601\"; }\n\n.fa-mars-double::before {\n  content: \"\\f227\"; }\n\n.fa-child-dress::before {\n  content: \"\\e59c\"; }\n\n.fa-users-between-lines::before {\n  content: \"\\e591\"; }\n\n.fa-lungs-virus::before {\n  content: \"\\e067\"; }\n\n.fa-face-grin-tears::before {\n  content: \"\\f588\"; }\n\n.fa-grin-tears::before {\n  content: \"\\f588\"; }\n\n.fa-phone::before {\n  content: \"\\f095\"; }\n\n.fa-calendar-xmark::before {\n  content: \"\\f273\"; }\n\n.fa-calendar-times::before {\n  content: \"\\f273\"; }\n\n.fa-child-reaching::before {\n  content: \"\\e59d\"; }\n\n.fa-head-side-virus::before {\n  content: \"\\e064\"; }\n\n.fa-user-gear::before {\n  content: \"\\f4fe\"; }\n\n.fa-user-cog::before {\n  content: \"\\f4fe\"; }\n\n.fa-arrow-up-1-9::before {\n  content: \"\\f163\"; }\n\n.fa-sort-numeric-up::before {\n  content: \"\\f163\"; }\n\n.fa-door-closed::before {\n  content: \"\\f52a\"; }\n\n.fa-shield-virus::before {\n  content: \"\\e06c\"; }\n\n.fa-dice-six::before {\n  content: \"\\f526\"; }\n\n.fa-mosquito-net::before {\n  content: \"\\e52c\"; }\n\n.fa-bridge-water::before {\n  content: \"\\e4ce\"; }\n\n.fa-person-booth::before {\n  content: \"\\f756\"; }\n\n.fa-text-width::before {\n  content: \"\\f035\"; }\n\n.fa-hat-wizard::before {\n  content: \"\\f6e8\"; }\n\n.fa-pen-fancy::before {\n  content: \"\\f5ac\"; }\n\n.fa-person-digging::before {\n  content: \"\\f85e\"; }\n\n.fa-digging::before {\n  content: \"\\f85e\"; }\n\n.fa-trash::before {\n  content: \"\\f1f8\"; }\n\n.fa-gauge-simple::before {\n  content: \"\\f629\"; }\n\n.fa-gauge-simple-med::before {\n  content: \"\\f629\"; }\n\n.fa-tachometer-average::before {\n  content: \"\\f629\"; }\n\n.fa-book-medical::before {\n  content: \"\\f7e6\"; }\n\n.fa-poo::before {\n  content: \"\\f2fe\"; }\n\n.fa-quote-right::before {\n  content: \"\\f10e\"; }\n\n.fa-quote-right-alt::before {\n  content: \"\\f10e\"; }\n\n.fa-shirt::before {\n  content: \"\\f553\"; }\n\n.fa-t-shirt::before {\n  content: \"\\f553\"; }\n\n.fa-tshirt::before {\n  content: \"\\f553\"; }\n\n.fa-cubes::before {\n  content: \"\\f1b3\"; }\n\n.fa-divide::before {\n  content: \"\\f529\"; }\n\n.fa-tenge-sign::before {\n  content: \"\\f7d7\"; }\n\n.fa-tenge::before {\n  content: \"\\f7d7\"; }\n\n.fa-headphones::before {\n  content: \"\\f025\"; }\n\n.fa-hands-holding::before {\n  content: \"\\f4c2\"; }\n\n.fa-hands-clapping::before {\n  content: \"\\e1a8\"; }\n\n.fa-republican::before {\n  content: \"\\f75e\"; }\n\n.fa-arrow-left::before {\n  content: \"\\f060\"; }\n\n.fa-person-circle-xmark::before {\n  content: \"\\e543\"; }\n\n.fa-ruler::before {\n  content: \"\\f545\"; }\n\n.fa-align-left::before {\n  content: \"\\f036\"; }\n\n.fa-dice-d6::before {\n  content: \"\\f6d1\"; }\n\n.fa-restroom::before {\n  content: \"\\f7bd\"; }\n\n.fa-j::before {\n  content: \"\\4a\"; }\n\n.fa-users-viewfinder::before {\n  content: \"\\e595\"; }\n\n.fa-file-video::before {\n  content: \"\\f1c8\"; }\n\n.fa-up-right-from-square::before {\n  content: \"\\f35d\"; }\n\n.fa-external-link-alt::before {\n  content: \"\\f35d\"; }\n\n.fa-table-cells::before {\n  content: \"\\f00a\"; }\n\n.fa-th::before {\n  content: \"\\f00a\"; }\n\n.fa-file-pdf::before {\n  content: \"\\f1c1\"; }\n\n.fa-book-bible::before {\n  content: \"\\f647\"; }\n\n.fa-bible::before {\n  content: \"\\f647\"; }\n\n.fa-o::before {\n  content: \"\\4f\"; }\n\n.fa-suitcase-medical::before {\n  content: \"\\f0fa\"; }\n\n.fa-medkit::before {\n  content: \"\\f0fa\"; }\n\n.fa-user-secret::before {\n  content: \"\\f21b\"; }\n\n.fa-otter::before {\n  content: \"\\f700\"; }\n\n.fa-person-dress::before {\n  content: \"\\f182\"; }\n\n.fa-female::before {\n  content: \"\\f182\"; }\n\n.fa-comment-dollar::before {\n  content: \"\\f651\"; }\n\n.fa-business-time::before {\n  content: \"\\f64a\"; }\n\n.fa-briefcase-clock::before {\n  content: \"\\f64a\"; }\n\n.fa-table-cells-large::before {\n  content: \"\\f009\"; }\n\n.fa-th-large::before {\n  content: \"\\f009\"; }\n\n.fa-book-tanakh::before {\n  content: \"\\f827\"; }\n\n.fa-tanakh::before {\n  content: \"\\f827\"; }\n\n.fa-phone-volume::before {\n  content: \"\\f2a0\"; }\n\n.fa-volume-control-phone::before {\n  content: \"\\f2a0\"; }\n\n.fa-hat-cowboy-side::before {\n  content: \"\\f8c1\"; }\n\n.fa-clipboard-user::before {\n  content: \"\\f7f3\"; }\n\n.fa-child::before {\n  content: \"\\f1ae\"; }\n\n.fa-lira-sign::before {\n  content: \"\\f195\"; }\n\n.fa-satellite::before {\n  content: \"\\f7bf\"; }\n\n.fa-plane-lock::before {\n  content: \"\\e558\"; }\n\n.fa-tag::before {\n  content: \"\\f02b\"; }\n\n.fa-comment::before {\n  content: \"\\f075\"; }\n\n.fa-cake-candles::before {\n  content: \"\\f1fd\"; }\n\n.fa-birthday-cake::before {\n  content: \"\\f1fd\"; }\n\n.fa-cake::before {\n  content: \"\\f1fd\"; }\n\n.fa-envelope::before {\n  content: \"\\f0e0\"; }\n\n.fa-angles-up::before {\n  content: \"\\f102\"; }\n\n.fa-angle-double-up::before {\n  content: \"\\f102\"; }\n\n.fa-paperclip::before {\n  content: \"\\f0c6\"; }\n\n.fa-arrow-right-to-city::before {\n  content: \"\\e4b3\"; }\n\n.fa-ribbon::before {\n  content: \"\\f4d6\"; }\n\n.fa-lungs::before {\n  content: \"\\f604\"; }\n\n.fa-arrow-up-9-1::before {\n  content: \"\\f887\"; }\n\n.fa-sort-numeric-up-alt::before {\n  content: \"\\f887\"; }\n\n.fa-litecoin-sign::before {\n  content: \"\\e1d3\"; }\n\n.fa-border-none::before {\n  content: \"\\f850\"; }\n\n.fa-circle-nodes::before {\n  content: \"\\e4e2\"; }\n\n.fa-parachute-box::before {\n  content: \"\\f4cd\"; }\n\n.fa-indent::before {\n  content: \"\\f03c\"; }\n\n.fa-truck-field-un::before {\n  content: \"\\e58e\"; }\n\n.fa-hourglass::before {\n  content: \"\\f254\"; }\n\n.fa-hourglass-empty::before {\n  content: \"\\f254\"; }\n\n.fa-mountain::before {\n  content: \"\\f6fc\"; }\n\n.fa-user-doctor::before {\n  content: \"\\f0f0\"; }\n\n.fa-user-md::before {\n  content: \"\\f0f0\"; }\n\n.fa-circle-info::before {\n  content: \"\\f05a\"; }\n\n.fa-info-circle::before {\n  content: \"\\f05a\"; }\n\n.fa-cloud-meatball::before {\n  content: \"\\f73b\"; }\n\n.fa-camera::before {\n  content: \"\\f030\"; }\n\n.fa-camera-alt::before {\n  content: \"\\f030\"; }\n\n.fa-square-virus::before {\n  content: \"\\e578\"; }\n\n.fa-meteor::before {\n  content: \"\\f753\"; }\n\n.fa-car-on::before {\n  content: \"\\e4dd\"; }\n\n.fa-sleigh::before {\n  content: \"\\f7cc\"; }\n\n.fa-arrow-down-1-9::before {\n  content: \"\\f162\"; }\n\n.fa-sort-numeric-asc::before {\n  content: \"\\f162\"; }\n\n.fa-sort-numeric-down::before {\n  content: \"\\f162\"; }\n\n.fa-hand-holding-droplet::before {\n  content: \"\\f4c1\"; }\n\n.fa-hand-holding-water::before {\n  content: \"\\f4c1\"; }\n\n.fa-water::before {\n  content: \"\\f773\"; }\n\n.fa-calendar-check::before {\n  content: \"\\f274\"; }\n\n.fa-braille::before {\n  content: \"\\f2a1\"; }\n\n.fa-prescription-bottle-medical::before {\n  content: \"\\f486\"; }\n\n.fa-prescription-bottle-alt::before {\n  content: \"\\f486\"; }\n\n.fa-landmark::before {\n  content: \"\\f66f\"; }\n\n.fa-truck::before {\n  content: \"\\f0d1\"; }\n\n.fa-crosshairs::before {\n  content: \"\\f05b\"; }\n\n.fa-person-cane::before {\n  content: \"\\e53c\"; }\n\n.fa-tent::before {\n  content: \"\\e57d\"; }\n\n.fa-vest-patches::before {\n  content: \"\\e086\"; }\n\n.fa-check-double::before {\n  content: \"\\f560\"; }\n\n.fa-arrow-down-a-z::before {\n  content: \"\\f15d\"; }\n\n.fa-sort-alpha-asc::before {\n  content: \"\\f15d\"; }\n\n.fa-sort-alpha-down::before {\n  content: \"\\f15d\"; }\n\n.fa-money-bill-wheat::before {\n  content: \"\\e52a\"; }\n\n.fa-cookie::before {\n  content: \"\\f563\"; }\n\n.fa-arrow-rotate-left::before {\n  content: \"\\f0e2\"; }\n\n.fa-arrow-left-rotate::before {\n  content: \"\\f0e2\"; }\n\n.fa-arrow-rotate-back::before {\n  content: \"\\f0e2\"; }\n\n.fa-arrow-rotate-backward::before {\n  content: \"\\f0e2\"; }\n\n.fa-undo::before {\n  content: \"\\f0e2\"; }\n\n.fa-hard-drive::before {\n  content: \"\\f0a0\"; }\n\n.fa-hdd::before {\n  content: \"\\f0a0\"; }\n\n.fa-face-grin-squint-tears::before {\n  content: \"\\f586\"; }\n\n.fa-grin-squint-tears::before {\n  content: \"\\f586\"; }\n\n.fa-dumbbell::before {\n  content: \"\\f44b\"; }\n\n.fa-rectangle-list::before {\n  content: \"\\f022\"; }\n\n.fa-list-alt::before {\n  content: \"\\f022\"; }\n\n.fa-tarp-droplet::before {\n  content: \"\\e57c\"; }\n\n.fa-house-medical-circle-check::before {\n  content: \"\\e511\"; }\n\n.fa-person-skiing-nordic::before {\n  content: \"\\f7ca\"; }\n\n.fa-skiing-nordic::before {\n  content: \"\\f7ca\"; }\n\n.fa-calendar-plus::before {\n  content: \"\\f271\"; }\n\n.fa-plane-arrival::before {\n  content: \"\\f5af\"; }\n\n.fa-circle-left::before {\n  content: \"\\f359\"; }\n\n.fa-arrow-alt-circle-left::before {\n  content: \"\\f359\"; }\n\n.fa-train-subway::before {\n  content: \"\\f239\"; }\n\n.fa-subway::before {\n  content: \"\\f239\"; }\n\n.fa-chart-gantt::before {\n  content: \"\\e0e4\"; }\n\n.fa-indian-rupee-sign::before {\n  content: \"\\e1bc\"; }\n\n.fa-indian-rupee::before {\n  content: \"\\e1bc\"; }\n\n.fa-inr::before {\n  content: \"\\e1bc\"; }\n\n.fa-crop-simple::before {\n  content: \"\\f565\"; }\n\n.fa-crop-alt::before {\n  content: \"\\f565\"; }\n\n.fa-money-bill-1::before {\n  content: \"\\f3d1\"; }\n\n.fa-money-bill-alt::before {\n  content: \"\\f3d1\"; }\n\n.fa-left-long::before {\n  content: \"\\f30a\"; }\n\n.fa-long-arrow-alt-left::before {\n  content: \"\\f30a\"; }\n\n.fa-dna::before {\n  content: \"\\f471\"; }\n\n.fa-virus-slash::before {\n  content: \"\\e075\"; }\n\n.fa-minus::before {\n  content: \"\\f068\"; }\n\n.fa-subtract::before {\n  content: \"\\f068\"; }\n\n.fa-chess::before {\n  content: \"\\f439\"; }\n\n.fa-arrow-left-long::before {\n  content: \"\\f177\"; }\n\n.fa-long-arrow-left::before {\n  content: \"\\f177\"; }\n\n.fa-plug-circle-check::before {\n  content: \"\\e55c\"; }\n\n.fa-street-view::before {\n  content: \"\\f21d\"; }\n\n.fa-franc-sign::before {\n  content: \"\\e18f\"; }\n\n.fa-volume-off::before {\n  content: \"\\f026\"; }\n\n.fa-hands-asl-interpreting::before {\n  content: \"\\f2a3\"; }\n\n.fa-american-sign-language-interpreting::before {\n  content: \"\\f2a3\"; }\n\n.fa-asl-interpreting::before {\n  content: \"\\f2a3\"; }\n\n.fa-hands-american-sign-language-interpreting::before {\n  content: \"\\f2a3\"; }\n\n.fa-gear::before {\n  content: \"\\f013\"; }\n\n.fa-cog::before {\n  content: \"\\f013\"; }\n\n.fa-droplet-slash::before {\n  content: \"\\f5c7\"; }\n\n.fa-tint-slash::before {\n  content: \"\\f5c7\"; }\n\n.fa-mosque::before {\n  content: \"\\f678\"; }\n\n.fa-mosquito::before {\n  content: \"\\e52b\"; }\n\n.fa-star-of-david::before {\n  content: \"\\f69a\"; }\n\n.fa-person-military-rifle::before {\n  content: \"\\e54b\"; }\n\n.fa-cart-shopping::before {\n  content: \"\\f07a\"; }\n\n.fa-shopping-cart::before {\n  content: \"\\f07a\"; }\n\n.fa-vials::before {\n  content: \"\\f493\"; }\n\n.fa-plug-circle-plus::before {\n  content: \"\\e55f\"; }\n\n.fa-place-of-worship::before {\n  content: \"\\f67f\"; }\n\n.fa-grip-vertical::before {\n  content: \"\\f58e\"; }\n\n.fa-arrow-turn-up::before {\n  content: \"\\f148\"; }\n\n.fa-level-up::before {\n  content: \"\\f148\"; }\n\n.fa-u::before {\n  content: \"\\55\"; }\n\n.fa-square-root-variable::before {\n  content: \"\\f698\"; }\n\n.fa-square-root-alt::before {\n  content: \"\\f698\"; }\n\n.fa-clock::before {\n  content: \"\\f017\"; }\n\n.fa-clock-four::before {\n  content: \"\\f017\"; }\n\n.fa-backward-step::before {\n  content: \"\\f048\"; }\n\n.fa-step-backward::before {\n  content: \"\\f048\"; }\n\n.fa-pallet::before {\n  content: \"\\f482\"; }\n\n.fa-faucet::before {\n  content: \"\\e005\"; }\n\n.fa-baseball-bat-ball::before {\n  content: \"\\f432\"; }\n\n.fa-s::before {\n  content: \"\\53\"; }\n\n.fa-timeline::before {\n  content: \"\\e29c\"; }\n\n.fa-keyboard::before {\n  content: \"\\f11c\"; }\n\n.fa-caret-down::before {\n  content: \"\\f0d7\"; }\n\n.fa-house-chimney-medical::before {\n  content: \"\\f7f2\"; }\n\n.fa-clinic-medical::before {\n  content: \"\\f7f2\"; }\n\n.fa-temperature-three-quarters::before {\n  content: \"\\f2c8\"; }\n\n.fa-temperature-3::before {\n  content: \"\\f2c8\"; }\n\n.fa-thermometer-3::before {\n  content: \"\\f2c8\"; }\n\n.fa-thermometer-three-quarters::before {\n  content: \"\\f2c8\"; }\n\n.fa-mobile-screen::before {\n  content: \"\\f3cf\"; }\n\n.fa-mobile-android-alt::before {\n  content: \"\\f3cf\"; }\n\n.fa-plane-up::before {\n  content: \"\\e22d\"; }\n\n.fa-piggy-bank::before {\n  content: \"\\f4d3\"; }\n\n.fa-battery-half::before {\n  content: \"\\f242\"; }\n\n.fa-battery-3::before {\n  content: \"\\f242\"; }\n\n.fa-mountain-city::before {\n  content: \"\\e52e\"; }\n\n.fa-coins::before {\n  content: \"\\f51e\"; }\n\n.fa-khanda::before {\n  content: \"\\f66d\"; }\n\n.fa-sliders::before {\n  content: \"\\f1de\"; }\n\n.fa-sliders-h::before {\n  content: \"\\f1de\"; }\n\n.fa-folder-tree::before {\n  content: \"\\f802\"; }\n\n.fa-network-wired::before {\n  content: \"\\f6ff\"; }\n\n.fa-map-pin::before {\n  content: \"\\f276\"; }\n\n.fa-hamsa::before {\n  content: \"\\f665\"; }\n\n.fa-cent-sign::before {\n  content: \"\\e3f5\"; }\n\n.fa-flask::before {\n  content: \"\\f0c3\"; }\n\n.fa-person-pregnant::before {\n  content: \"\\e31e\"; }\n\n.fa-wand-sparkles::before {\n  content: \"\\f72b\"; }\n\n.fa-ellipsis-vertical::before {\n  content: \"\\f142\"; }\n\n.fa-ellipsis-v::before {\n  content: \"\\f142\"; }\n\n.fa-ticket::before {\n  content: \"\\f145\"; }\n\n.fa-power-off::before {\n  content: \"\\f011\"; }\n\n.fa-right-long::before {\n  content: \"\\f30b\"; }\n\n.fa-long-arrow-alt-right::before {\n  content: \"\\f30b\"; }\n\n.fa-flag-usa::before {\n  content: \"\\f74d\"; }\n\n.fa-laptop-file::before {\n  content: \"\\e51d\"; }\n\n.fa-tty::before {\n  content: \"\\f1e4\"; }\n\n.fa-teletype::before {\n  content: \"\\f1e4\"; }\n\n.fa-diagram-next::before {\n  content: \"\\e476\"; }\n\n.fa-person-rifle::before {\n  content: \"\\e54e\"; }\n\n.fa-house-medical-circle-exclamation::before {\n  content: \"\\e512\"; }\n\n.fa-closed-captioning::before {\n  content: \"\\f20a\"; }\n\n.fa-person-hiking::before {\n  content: \"\\f6ec\"; }\n\n.fa-hiking::before {\n  content: \"\\f6ec\"; }\n\n.fa-venus-double::before {\n  content: \"\\f226\"; }\n\n.fa-images::before {\n  content: \"\\f302\"; }\n\n.fa-calculator::before {\n  content: \"\\f1ec\"; }\n\n.fa-people-pulling::before {\n  content: \"\\e535\"; }\n\n.fa-n::before {\n  content: \"\\4e\"; }\n\n.fa-cable-car::before {\n  content: \"\\f7da\"; }\n\n.fa-tram::before {\n  content: \"\\f7da\"; }\n\n.fa-cloud-rain::before {\n  content: \"\\f73d\"; }\n\n.fa-building-circle-xmark::before {\n  content: \"\\e4d4\"; }\n\n.fa-ship::before {\n  content: \"\\f21a\"; }\n\n.fa-arrows-down-to-line::before {\n  content: \"\\e4b8\"; }\n\n.fa-download::before {\n  content: \"\\f019\"; }\n\n.fa-face-grin::before {\n  content: \"\\f580\"; }\n\n.fa-grin::before {\n  content: \"\\f580\"; }\n\n.fa-delete-left::before {\n  content: \"\\f55a\"; }\n\n.fa-backspace::before {\n  content: \"\\f55a\"; }\n\n.fa-eye-dropper::before {\n  content: \"\\f1fb\"; }\n\n.fa-eye-dropper-empty::before {\n  content: \"\\f1fb\"; }\n\n.fa-eyedropper::before {\n  content: \"\\f1fb\"; }\n\n.fa-file-circle-check::before {\n  content: \"\\e5a0\"; }\n\n.fa-forward::before {\n  content: \"\\f04e\"; }\n\n.fa-mobile::before {\n  content: \"\\f3ce\"; }\n\n.fa-mobile-android::before {\n  content: \"\\f3ce\"; }\n\n.fa-mobile-phone::before {\n  content: \"\\f3ce\"; }\n\n.fa-face-meh::before {\n  content: \"\\f11a\"; }\n\n.fa-meh::before {\n  content: \"\\f11a\"; }\n\n.fa-align-center::before {\n  content: \"\\f037\"; }\n\n.fa-book-skull::before {\n  content: \"\\f6b7\"; }\n\n.fa-book-dead::before {\n  content: \"\\f6b7\"; }\n\n.fa-id-card::before {\n  content: \"\\f2c2\"; }\n\n.fa-drivers-license::before {\n  content: \"\\f2c2\"; }\n\n.fa-outdent::before {\n  content: \"\\f03b\"; }\n\n.fa-dedent::before {\n  content: \"\\f03b\"; }\n\n.fa-heart-circle-exclamation::before {\n  content: \"\\e4fe\"; }\n\n.fa-house::before {\n  content: \"\\f015\"; }\n\n.fa-home::before {\n  content: \"\\f015\"; }\n\n.fa-home-alt::before {\n  content: \"\\f015\"; }\n\n.fa-home-lg-alt::before {\n  content: \"\\f015\"; }\n\n.fa-calendar-week::before {\n  content: \"\\f784\"; }\n\n.fa-laptop-medical::before {\n  content: \"\\f812\"; }\n\n.fa-b::before {\n  content: \"\\42\"; }\n\n.fa-file-medical::before {\n  content: \"\\f477\"; }\n\n.fa-dice-one::before {\n  content: \"\\f525\"; }\n\n.fa-kiwi-bird::before {\n  content: \"\\f535\"; }\n\n.fa-arrow-right-arrow-left::before {\n  content: \"\\f0ec\"; }\n\n.fa-exchange::before {\n  content: \"\\f0ec\"; }\n\n.fa-rotate-right::before {\n  content: \"\\f2f9\"; }\n\n.fa-redo-alt::before {\n  content: \"\\f2f9\"; }\n\n.fa-rotate-forward::before {\n  content: \"\\f2f9\"; }\n\n.fa-utensils::before {\n  content: \"\\f2e7\"; }\n\n.fa-cutlery::before {\n  content: \"\\f2e7\"; }\n\n.fa-arrow-up-wide-short::before {\n  content: \"\\f161\"; }\n\n.fa-sort-amount-up::before {\n  content: \"\\f161\"; }\n\n.fa-mill-sign::before {\n  content: \"\\e1ed\"; }\n\n.fa-bowl-rice::before {\n  content: \"\\e2eb\"; }\n\n.fa-skull::before {\n  content: \"\\f54c\"; }\n\n.fa-tower-broadcast::before {\n  content: \"\\f519\"; }\n\n.fa-broadcast-tower::before {\n  content: \"\\f519\"; }\n\n.fa-truck-pickup::before {\n  content: \"\\f63c\"; }\n\n.fa-up-long::before {\n  content: \"\\f30c\"; }\n\n.fa-long-arrow-alt-up::before {\n  content: \"\\f30c\"; }\n\n.fa-stop::before {\n  content: \"\\f04d\"; }\n\n.fa-code-merge::before {\n  content: \"\\f387\"; }\n\n.fa-upload::before {\n  content: \"\\f093\"; }\n\n.fa-hurricane::before {\n  content: \"\\f751\"; }\n\n.fa-mound::before {\n  content: \"\\e52d\"; }\n\n.fa-toilet-portable::before {\n  content: \"\\e583\"; }\n\n.fa-compact-disc::before {\n  content: \"\\f51f\"; }\n\n.fa-file-arrow-down::before {\n  content: \"\\f56d\"; }\n\n.fa-file-download::before {\n  content: \"\\f56d\"; }\n\n.fa-caravan::before {\n  content: \"\\f8ff\"; }\n\n.fa-shield-cat::before {\n  content: \"\\e572\"; }\n\n.fa-bolt::before {\n  content: \"\\f0e7\"; }\n\n.fa-zap::before {\n  content: \"\\f0e7\"; }\n\n.fa-glass-water::before {\n  content: \"\\e4f4\"; }\n\n.fa-oil-well::before {\n  content: \"\\e532\"; }\n\n.fa-vault::before {\n  content: \"\\e2c5\"; }\n\n.fa-mars::before {\n  content: \"\\f222\"; }\n\n.fa-toilet::before {\n  content: \"\\f7d8\"; }\n\n.fa-plane-circle-xmark::before {\n  content: \"\\e557\"; }\n\n.fa-yen-sign::before {\n  content: \"\\f157\"; }\n\n.fa-cny::before {\n  content: \"\\f157\"; }\n\n.fa-jpy::before {\n  content: \"\\f157\"; }\n\n.fa-rmb::before {\n  content: \"\\f157\"; }\n\n.fa-yen::before {\n  content: \"\\f157\"; }\n\n.fa-ruble-sign::before {\n  content: \"\\f158\"; }\n\n.fa-rouble::before {\n  content: \"\\f158\"; }\n\n.fa-rub::before {\n  content: \"\\f158\"; }\n\n.fa-ruble::before {\n  content: \"\\f158\"; }\n\n.fa-sun::before {\n  content: \"\\f185\"; }\n\n.fa-guitar::before {\n  content: \"\\f7a6\"; }\n\n.fa-face-laugh-wink::before {\n  content: \"\\f59c\"; }\n\n.fa-laugh-wink::before {\n  content: \"\\f59c\"; }\n\n.fa-horse-head::before {\n  content: \"\\f7ab\"; }\n\n.fa-bore-hole::before {\n  content: \"\\e4c3\"; }\n\n.fa-industry::before {\n  content: \"\\f275\"; }\n\n.fa-circle-down::before {\n  content: \"\\f358\"; }\n\n.fa-arrow-alt-circle-down::before {\n  content: \"\\f358\"; }\n\n.fa-arrows-turn-to-dots::before {\n  content: \"\\e4c1\"; }\n\n.fa-florin-sign::before {\n  content: \"\\e184\"; }\n\n.fa-arrow-down-short-wide::before {\n  content: \"\\f884\"; }\n\n.fa-sort-amount-desc::before {\n  content: \"\\f884\"; }\n\n.fa-sort-amount-down-alt::before {\n  content: \"\\f884\"; }\n\n.fa-less-than::before {\n  content: \"\\3c\"; }\n\n.fa-angle-down::before {\n  content: \"\\f107\"; }\n\n.fa-car-tunnel::before {\n  content: \"\\e4de\"; }\n\n.fa-head-side-cough::before {\n  content: \"\\e061\"; }\n\n.fa-grip-lines::before {\n  content: \"\\f7a4\"; }\n\n.fa-thumbs-down::before {\n  content: \"\\f165\"; }\n\n.fa-user-lock::before {\n  content: \"\\f502\"; }\n\n.fa-arrow-right-long::before {\n  content: \"\\f178\"; }\n\n.fa-long-arrow-right::before {\n  content: \"\\f178\"; }\n\n.fa-anchor-circle-xmark::before {\n  content: \"\\e4ac\"; }\n\n.fa-ellipsis::before {\n  content: \"\\f141\"; }\n\n.fa-ellipsis-h::before {\n  content: \"\\f141\"; }\n\n.fa-chess-pawn::before {\n  content: \"\\f443\"; }\n\n.fa-kit-medical::before {\n  content: \"\\f479\"; }\n\n.fa-first-aid::before {\n  content: \"\\f479\"; }\n\n.fa-person-through-window::before {\n  content: \"\\e5a9\"; }\n\n.fa-toolbox::before {\n  content: \"\\f552\"; }\n\n.fa-hands-holding-circle::before {\n  content: \"\\e4fb\"; }\n\n.fa-bug::before {\n  content: \"\\f188\"; }\n\n.fa-credit-card::before {\n  content: \"\\f09d\"; }\n\n.fa-credit-card-alt::before {\n  content: \"\\f09d\"; }\n\n.fa-car::before {\n  content: \"\\f1b9\"; }\n\n.fa-automobile::before {\n  content: \"\\f1b9\"; }\n\n.fa-hand-holding-hand::before {\n  content: \"\\e4f7\"; }\n\n.fa-book-open-reader::before {\n  content: \"\\f5da\"; }\n\n.fa-book-reader::before {\n  content: \"\\f5da\"; }\n\n.fa-mountain-sun::before {\n  content: \"\\e52f\"; }\n\n.fa-arrows-left-right-to-line::before {\n  content: \"\\e4ba\"; }\n\n.fa-dice-d20::before {\n  content: \"\\f6cf\"; }\n\n.fa-truck-droplet::before {\n  content: \"\\e58c\"; }\n\n.fa-file-circle-xmark::before {\n  content: \"\\e5a1\"; }\n\n.fa-temperature-arrow-up::before {\n  content: \"\\e040\"; }\n\n.fa-temperature-up::before {\n  content: \"\\e040\"; }\n\n.fa-medal::before {\n  content: \"\\f5a2\"; }\n\n.fa-bed::before {\n  content: \"\\f236\"; }\n\n.fa-square-h::before {\n  content: \"\\f0fd\"; }\n\n.fa-h-square::before {\n  content: \"\\f0fd\"; }\n\n.fa-podcast::before {\n  content: \"\\f2ce\"; }\n\n.fa-temperature-full::before {\n  content: \"\\f2c7\"; }\n\n.fa-temperature-4::before {\n  content: \"\\f2c7\"; }\n\n.fa-thermometer-4::before {\n  content: \"\\f2c7\"; }\n\n.fa-thermometer-full::before {\n  content: \"\\f2c7\"; }\n\n.fa-bell::before {\n  content: \"\\f0f3\"; }\n\n.fa-superscript::before {\n  content: \"\\f12b\"; }\n\n.fa-plug-circle-xmark::before {\n  content: \"\\e560\"; }\n\n.fa-star-of-life::before {\n  content: \"\\f621\"; }\n\n.fa-phone-slash::before {\n  content: \"\\f3dd\"; }\n\n.fa-paint-roller::before {\n  content: \"\\f5aa\"; }\n\n.fa-handshake-angle::before {\n  content: \"\\f4c4\"; }\n\n.fa-hands-helping::before {\n  content: \"\\f4c4\"; }\n\n.fa-location-dot::before {\n  content: \"\\f3c5\"; }\n\n.fa-map-marker-alt::before {\n  content: \"\\f3c5\"; }\n\n.fa-file::before {\n  content: \"\\f15b\"; }\n\n.fa-greater-than::before {\n  content: \"\\3e\"; }\n\n.fa-person-swimming::before {\n  content: \"\\f5c4\"; }\n\n.fa-swimmer::before {\n  content: \"\\f5c4\"; }\n\n.fa-arrow-down::before {\n  content: \"\\f063\"; }\n\n.fa-droplet::before {\n  content: \"\\f043\"; }\n\n.fa-tint::before {\n  content: \"\\f043\"; }\n\n.fa-eraser::before {\n  content: \"\\f12d\"; }\n\n.fa-earth-americas::before {\n  content: \"\\f57d\"; }\n\n.fa-earth::before {\n  content: \"\\f57d\"; }\n\n.fa-earth-america::before {\n  content: \"\\f57d\"; }\n\n.fa-globe-americas::before {\n  content: \"\\f57d\"; }\n\n.fa-person-burst::before {\n  content: \"\\e53b\"; }\n\n.fa-dove::before {\n  content: \"\\f4ba\"; }\n\n.fa-battery-empty::before {\n  content: \"\\f244\"; }\n\n.fa-battery-0::before {\n  content: \"\\f244\"; }\n\n.fa-socks::before {\n  content: \"\\f696\"; }\n\n.fa-inbox::before {\n  content: \"\\f01c\"; }\n\n.fa-section::before {\n  content: \"\\e447\"; }\n\n.fa-gauge-high::before {\n  content: \"\\f625\"; }\n\n.fa-tachometer-alt::before {\n  content: \"\\f625\"; }\n\n.fa-tachometer-alt-fast::before {\n  content: \"\\f625\"; }\n\n.fa-envelope-open-text::before {\n  content: \"\\f658\"; }\n\n.fa-hospital::before {\n  content: \"\\f0f8\"; }\n\n.fa-hospital-alt::before {\n  content: \"\\f0f8\"; }\n\n.fa-hospital-wide::before {\n  content: \"\\f0f8\"; }\n\n.fa-wine-bottle::before {\n  content: \"\\f72f\"; }\n\n.fa-chess-rook::before {\n  content: \"\\f447\"; }\n\n.fa-bars-staggered::before {\n  content: \"\\f550\"; }\n\n.fa-reorder::before {\n  content: \"\\f550\"; }\n\n.fa-stream::before {\n  content: \"\\f550\"; }\n\n.fa-dharmachakra::before {\n  content: \"\\f655\"; }\n\n.fa-hotdog::before {\n  content: \"\\f80f\"; }\n\n.fa-person-walking-with-cane::before {\n  content: \"\\f29d\"; }\n\n.fa-blind::before {\n  content: \"\\f29d\"; }\n\n.fa-drum::before {\n  content: \"\\f569\"; }\n\n.fa-ice-cream::before {\n  content: \"\\f810\"; }\n\n.fa-heart-circle-bolt::before {\n  content: \"\\e4fc\"; }\n\n.fa-fax::before {\n  content: \"\\f1ac\"; }\n\n.fa-paragraph::before {\n  content: \"\\f1dd\"; }\n\n.fa-check-to-slot::before {\n  content: \"\\f772\"; }\n\n.fa-vote-yea::before {\n  content: \"\\f772\"; }\n\n.fa-star-half::before {\n  content: \"\\f089\"; }\n\n.fa-boxes-stacked::before {\n  content: \"\\f468\"; }\n\n.fa-boxes::before {\n  content: \"\\f468\"; }\n\n.fa-boxes-alt::before {\n  content: \"\\f468\"; }\n\n.fa-link::before {\n  content: \"\\f0c1\"; }\n\n.fa-chain::before {\n  content: \"\\f0c1\"; }\n\n.fa-ear-listen::before {\n  content: \"\\f2a2\"; }\n\n.fa-assistive-listening-systems::before {\n  content: \"\\f2a2\"; }\n\n.fa-tree-city::before {\n  content: \"\\e587\"; }\n\n.fa-play::before {\n  content: \"\\f04b\"; }\n\n.fa-font::before {\n  content: \"\\f031\"; }\n\n.fa-rupiah-sign::before {\n  content: \"\\e23d\"; }\n\n.fa-magnifying-glass::before {\n  content: \"\\f002\"; }\n\n.fa-search::before {\n  content: \"\\f002\"; }\n\n.fa-table-tennis-paddle-ball::before {\n  content: \"\\f45d\"; }\n\n.fa-ping-pong-paddle-ball::before {\n  content: \"\\f45d\"; }\n\n.fa-table-tennis::before {\n  content: \"\\f45d\"; }\n\n.fa-person-dots-from-line::before {\n  content: \"\\f470\"; }\n\n.fa-diagnoses::before {\n  content: \"\\f470\"; }\n\n.fa-trash-can-arrow-up::before {\n  content: \"\\f82a\"; }\n\n.fa-trash-restore-alt::before {\n  content: \"\\f82a\"; }\n\n.fa-naira-sign::before {\n  content: \"\\e1f6\"; }\n\n.fa-cart-arrow-down::before {\n  content: \"\\f218\"; }\n\n.fa-walkie-talkie::before {\n  content: \"\\f8ef\"; }\n\n.fa-file-pen::before {\n  content: \"\\f31c\"; }\n\n.fa-file-edit::before {\n  content: \"\\f31c\"; }\n\n.fa-receipt::before {\n  content: \"\\f543\"; }\n\n.fa-square-pen::before {\n  content: \"\\f14b\"; }\n\n.fa-pen-square::before {\n  content: \"\\f14b\"; }\n\n.fa-pencil-square::before {\n  content: \"\\f14b\"; }\n\n.fa-suitcase-rolling::before {\n  content: \"\\f5c1\"; }\n\n.fa-person-circle-exclamation::before {\n  content: \"\\e53f\"; }\n\n.fa-chevron-down::before {\n  content: \"\\f078\"; }\n\n.fa-battery-full::before {\n  content: \"\\f240\"; }\n\n.fa-battery::before {\n  content: \"\\f240\"; }\n\n.fa-battery-5::before {\n  content: \"\\f240\"; }\n\n.fa-skull-crossbones::before {\n  content: \"\\f714\"; }\n\n.fa-code-compare::before {\n  content: \"\\e13a\"; }\n\n.fa-list-ul::before {\n  content: \"\\f0ca\"; }\n\n.fa-list-dots::before {\n  content: \"\\f0ca\"; }\n\n.fa-school-lock::before {\n  content: \"\\e56f\"; }\n\n.fa-tower-cell::before {\n  content: \"\\e585\"; }\n\n.fa-down-long::before {\n  content: \"\\f309\"; }\n\n.fa-long-arrow-alt-down::before {\n  content: \"\\f309\"; }\n\n.fa-ranking-star::before {\n  content: \"\\e561\"; }\n\n.fa-chess-king::before {\n  content: \"\\f43f\"; }\n\n.fa-person-harassing::before {\n  content: \"\\e549\"; }\n\n.fa-brazilian-real-sign::before {\n  content: \"\\e46c\"; }\n\n.fa-landmark-dome::before {\n  content: \"\\f752\"; }\n\n.fa-landmark-alt::before {\n  content: \"\\f752\"; }\n\n.fa-arrow-up::before {\n  content: \"\\f062\"; }\n\n.fa-tv::before {\n  content: \"\\f26c\"; }\n\n.fa-television::before {\n  content: \"\\f26c\"; }\n\n.fa-tv-alt::before {\n  content: \"\\f26c\"; }\n\n.fa-shrimp::before {\n  content: \"\\e448\"; }\n\n.fa-list-check::before {\n  content: \"\\f0ae\"; }\n\n.fa-tasks::before {\n  content: \"\\f0ae\"; }\n\n.fa-jug-detergent::before {\n  content: \"\\e519\"; }\n\n.fa-circle-user::before {\n  content: \"\\f2bd\"; }\n\n.fa-user-circle::before {\n  content: \"\\f2bd\"; }\n\n.fa-user-shield::before {\n  content: \"\\f505\"; }\n\n.fa-wind::before {\n  content: \"\\f72e\"; }\n\n.fa-car-burst::before {\n  content: \"\\f5e1\"; }\n\n.fa-car-crash::before {\n  content: \"\\f5e1\"; }\n\n.fa-y::before {\n  content: \"\\59\"; }\n\n.fa-person-snowboarding::before {\n  content: \"\\f7ce\"; }\n\n.fa-snowboarding::before {\n  content: \"\\f7ce\"; }\n\n.fa-truck-fast::before {\n  content: \"\\f48b\"; }\n\n.fa-shipping-fast::before {\n  content: \"\\f48b\"; }\n\n.fa-fish::before {\n  content: \"\\f578\"; }\n\n.fa-user-graduate::before {\n  content: \"\\f501\"; }\n\n.fa-circle-half-stroke::before {\n  content: \"\\f042\"; }\n\n.fa-adjust::before {\n  content: \"\\f042\"; }\n\n.fa-clapperboard::before {\n  content: \"\\e131\"; }\n\n.fa-circle-radiation::before {\n  content: \"\\f7ba\"; }\n\n.fa-radiation-alt::before {\n  content: \"\\f7ba\"; }\n\n.fa-baseball::before {\n  content: \"\\f433\"; }\n\n.fa-baseball-ball::before {\n  content: \"\\f433\"; }\n\n.fa-jet-fighter-up::before {\n  content: \"\\e518\"; }\n\n.fa-diagram-project::before {\n  content: \"\\f542\"; }\n\n.fa-project-diagram::before {\n  content: \"\\f542\"; }\n\n.fa-copy::before {\n  content: \"\\f0c5\"; }\n\n.fa-volume-xmark::before {\n  content: \"\\f6a9\"; }\n\n.fa-volume-mute::before {\n  content: \"\\f6a9\"; }\n\n.fa-volume-times::before {\n  content: \"\\f6a9\"; }\n\n.fa-hand-sparkles::before {\n  content: \"\\e05d\"; }\n\n.fa-grip::before {\n  content: \"\\f58d\"; }\n\n.fa-grip-horizontal::before {\n  content: \"\\f58d\"; }\n\n.fa-share-from-square::before {\n  content: \"\\f14d\"; }\n\n.fa-share-square::before {\n  content: \"\\f14d\"; }\n\n.fa-child-combatant::before {\n  content: \"\\e4e0\"; }\n\n.fa-child-rifle::before {\n  content: \"\\e4e0\"; }\n\n.fa-gun::before {\n  content: \"\\e19b\"; }\n\n.fa-square-phone::before {\n  content: \"\\f098\"; }\n\n.fa-phone-square::before {\n  content: \"\\f098\"; }\n\n.fa-plus::before {\n  content: \"\\2b\"; }\n\n.fa-add::before {\n  content: \"\\2b\"; }\n\n.fa-expand::before {\n  content: \"\\f065\"; }\n\n.fa-computer::before {\n  content: \"\\e4e5\"; }\n\n.fa-xmark::before {\n  content: \"\\f00d\"; }\n\n.fa-close::before {\n  content: \"\\f00d\"; }\n\n.fa-multiply::before {\n  content: \"\\f00d\"; }\n\n.fa-remove::before {\n  content: \"\\f00d\"; }\n\n.fa-times::before {\n  content: \"\\f00d\"; }\n\n.fa-arrows-up-down-left-right::before {\n  content: \"\\f047\"; }\n\n.fa-arrows::before {\n  content: \"\\f047\"; }\n\n.fa-chalkboard-user::before {\n  content: \"\\f51c\"; }\n\n.fa-chalkboard-teacher::before {\n  content: \"\\f51c\"; }\n\n.fa-peso-sign::before {\n  content: \"\\e222\"; }\n\n.fa-building-shield::before {\n  content: \"\\e4d8\"; }\n\n.fa-baby::before {\n  content: \"\\f77c\"; }\n\n.fa-users-line::before {\n  content: \"\\e592\"; }\n\n.fa-quote-left::before {\n  content: \"\\f10d\"; }\n\n.fa-quote-left-alt::before {\n  content: \"\\f10d\"; }\n\n.fa-tractor::before {\n  content: \"\\f722\"; }\n\n.fa-trash-arrow-up::before {\n  content: \"\\f829\"; }\n\n.fa-trash-restore::before {\n  content: \"\\f829\"; }\n\n.fa-arrow-down-up-lock::before {\n  content: \"\\e4b0\"; }\n\n.fa-lines-leaning::before {\n  content: \"\\e51e\"; }\n\n.fa-ruler-combined::before {\n  content: \"\\f546\"; }\n\n.fa-copyright::before {\n  content: \"\\f1f9\"; }\n\n.fa-equals::before {\n  content: \"\\3d\"; }\n\n.fa-blender::before {\n  content: \"\\f517\"; }\n\n.fa-teeth::before {\n  content: \"\\f62e\"; }\n\n.fa-shekel-sign::before {\n  content: \"\\f20b\"; }\n\n.fa-ils::before {\n  content: \"\\f20b\"; }\n\n.fa-shekel::before {\n  content: \"\\f20b\"; }\n\n.fa-sheqel::before {\n  content: \"\\f20b\"; }\n\n.fa-sheqel-sign::before {\n  content: \"\\f20b\"; }\n\n.fa-map::before {\n  content: \"\\f279\"; }\n\n.fa-rocket::before {\n  content: \"\\f135\"; }\n\n.fa-photo-film::before {\n  content: \"\\f87c\"; }\n\n.fa-photo-video::before {\n  content: \"\\f87c\"; }\n\n.fa-folder-minus::before {\n  content: \"\\f65d\"; }\n\n.fa-store::before {\n  content: \"\\f54e\"; }\n\n.fa-arrow-trend-up::before {\n  content: \"\\e098\"; }\n\n.fa-plug-circle-minus::before {\n  content: \"\\e55e\"; }\n\n.fa-sign-hanging::before {\n  content: \"\\f4d9\"; }\n\n.fa-sign::before {\n  content: \"\\f4d9\"; }\n\n.fa-bezier-curve::before {\n  content: \"\\f55b\"; }\n\n.fa-bell-slash::before {\n  content: \"\\f1f6\"; }\n\n.fa-tablet::before {\n  content: \"\\f3fb\"; }\n\n.fa-tablet-android::before {\n  content: \"\\f3fb\"; }\n\n.fa-school-flag::before {\n  content: \"\\e56e\"; }\n\n.fa-fill::before {\n  content: \"\\f575\"; }\n\n.fa-angle-up::before {\n  content: \"\\f106\"; }\n\n.fa-drumstick-bite::before {\n  content: \"\\f6d7\"; }\n\n.fa-holly-berry::before {\n  content: \"\\f7aa\"; }\n\n.fa-chevron-left::before {\n  content: \"\\f053\"; }\n\n.fa-bacteria::before {\n  content: \"\\e059\"; }\n\n.fa-hand-lizard::before {\n  content: \"\\f258\"; }\n\n.fa-notdef::before {\n  content: \"\\e1fe\"; }\n\n.fa-disease::before {\n  content: \"\\f7fa\"; }\n\n.fa-briefcase-medical::before {\n  content: \"\\f469\"; }\n\n.fa-genderless::before {\n  content: \"\\f22d\"; }\n\n.fa-chevron-right::before {\n  content: \"\\f054\"; }\n\n.fa-retweet::before {\n  content: \"\\f079\"; }\n\n.fa-car-rear::before {\n  content: \"\\f5de\"; }\n\n.fa-car-alt::before {\n  content: \"\\f5de\"; }\n\n.fa-pump-soap::before {\n  content: \"\\e06b\"; }\n\n.fa-video-slash::before {\n  content: \"\\f4e2\"; }\n\n.fa-battery-quarter::before {\n  content: \"\\f243\"; }\n\n.fa-battery-2::before {\n  content: \"\\f243\"; }\n\n.fa-radio::before {\n  content: \"\\f8d7\"; }\n\n.fa-baby-carriage::before {\n  content: \"\\f77d\"; }\n\n.fa-carriage-baby::before {\n  content: \"\\f77d\"; }\n\n.fa-traffic-light::before {\n  content: \"\\f637\"; }\n\n.fa-thermometer::before {\n  content: \"\\f491\"; }\n\n.fa-vr-cardboard::before {\n  content: \"\\f729\"; }\n\n.fa-hand-middle-finger::before {\n  content: \"\\f806\"; }\n\n.fa-percent::before {\n  content: \"\\25\"; }\n\n.fa-percentage::before {\n  content: \"\\25\"; }\n\n.fa-truck-moving::before {\n  content: \"\\f4df\"; }\n\n.fa-glass-water-droplet::before {\n  content: \"\\e4f5\"; }\n\n.fa-display::before {\n  content: \"\\e163\"; }\n\n.fa-face-smile::before {\n  content: \"\\f118\"; }\n\n.fa-smile::before {\n  content: \"\\f118\"; }\n\n.fa-thumbtack::before {\n  content: \"\\f08d\"; }\n\n.fa-thumb-tack::before {\n  content: \"\\f08d\"; }\n\n.fa-trophy::before {\n  content: \"\\f091\"; }\n\n.fa-person-praying::before {\n  content: \"\\f683\"; }\n\n.fa-pray::before {\n  content: \"\\f683\"; }\n\n.fa-hammer::before {\n  content: \"\\f6e3\"; }\n\n.fa-hand-peace::before {\n  content: \"\\f25b\"; }\n\n.fa-rotate::before {\n  content: \"\\f2f1\"; }\n\n.fa-sync-alt::before {\n  content: \"\\f2f1\"; }\n\n.fa-spinner::before {\n  content: \"\\f110\"; }\n\n.fa-robot::before {\n  content: \"\\f544\"; }\n\n.fa-peace::before {\n  content: \"\\f67c\"; }\n\n.fa-gears::before {\n  content: \"\\f085\"; }\n\n.fa-cogs::before {\n  content: \"\\f085\"; }\n\n.fa-warehouse::before {\n  content: \"\\f494\"; }\n\n.fa-arrow-up-right-dots::before {\n  content: \"\\e4b7\"; }\n\n.fa-splotch::before {\n  content: \"\\f5bc\"; }\n\n.fa-face-grin-hearts::before {\n  content: \"\\f584\"; }\n\n.fa-grin-hearts::before {\n  content: \"\\f584\"; }\n\n.fa-dice-four::before {\n  content: \"\\f524\"; }\n\n.fa-sim-card::before {\n  content: \"\\f7c4\"; }\n\n.fa-transgender::before {\n  content: \"\\f225\"; }\n\n.fa-transgender-alt::before {\n  content: \"\\f225\"; }\n\n.fa-mercury::before {\n  content: \"\\f223\"; }\n\n.fa-arrow-turn-down::before {\n  content: \"\\f149\"; }\n\n.fa-level-down::before {\n  content: \"\\f149\"; }\n\n.fa-person-falling-burst::before {\n  content: \"\\e547\"; }\n\n.fa-award::before {\n  content: \"\\f559\"; }\n\n.fa-ticket-simple::before {\n  content: \"\\f3ff\"; }\n\n.fa-ticket-alt::before {\n  content: \"\\f3ff\"; }\n\n.fa-building::before {\n  content: \"\\f1ad\"; }\n\n.fa-angles-left::before {\n  content: \"\\f100\"; }\n\n.fa-angle-double-left::before {\n  content: \"\\f100\"; }\n\n.fa-qrcode::before {\n  content: \"\\f029\"; }\n\n.fa-clock-rotate-left::before {\n  content: \"\\f1da\"; }\n\n.fa-history::before {\n  content: \"\\f1da\"; }\n\n.fa-face-grin-beam-sweat::before {\n  content: \"\\f583\"; }\n\n.fa-grin-beam-sweat::before {\n  content: \"\\f583\"; }\n\n.fa-file-export::before {\n  content: \"\\f56e\"; }\n\n.fa-arrow-right-from-file::before {\n  content: \"\\f56e\"; }\n\n.fa-shield::before {\n  content: \"\\f132\"; }\n\n.fa-shield-blank::before {\n  content: \"\\f132\"; }\n\n.fa-arrow-up-short-wide::before {\n  content: \"\\f885\"; }\n\n.fa-sort-amount-up-alt::before {\n  content: \"\\f885\"; }\n\n.fa-house-medical::before {\n  content: \"\\e3b2\"; }\n\n.fa-golf-ball-tee::before {\n  content: \"\\f450\"; }\n\n.fa-golf-ball::before {\n  content: \"\\f450\"; }\n\n.fa-circle-chevron-left::before {\n  content: \"\\f137\"; }\n\n.fa-chevron-circle-left::before {\n  content: \"\\f137\"; }\n\n.fa-house-chimney-window::before {\n  content: \"\\e00d\"; }\n\n.fa-pen-nib::before {\n  content: \"\\f5ad\"; }\n\n.fa-tent-arrow-turn-left::before {\n  content: \"\\e580\"; }\n\n.fa-tents::before {\n  content: \"\\e582\"; }\n\n.fa-wand-magic::before {\n  content: \"\\f0d0\"; }\n\n.fa-magic::before {\n  content: \"\\f0d0\"; }\n\n.fa-dog::before {\n  content: \"\\f6d3\"; }\n\n.fa-carrot::before {\n  content: \"\\f787\"; }\n\n.fa-moon::before {\n  content: \"\\f186\"; }\n\n.fa-wine-glass-empty::before {\n  content: \"\\f5ce\"; }\n\n.fa-wine-glass-alt::before {\n  content: \"\\f5ce\"; }\n\n.fa-cheese::before {\n  content: \"\\f7ef\"; }\n\n.fa-yin-yang::before {\n  content: \"\\f6ad\"; }\n\n.fa-music::before {\n  content: \"\\f001\"; }\n\n.fa-code-commit::before {\n  content: \"\\f386\"; }\n\n.fa-temperature-low::before {\n  content: \"\\f76b\"; }\n\n.fa-person-biking::before {\n  content: \"\\f84a\"; }\n\n.fa-biking::before {\n  content: \"\\f84a\"; }\n\n.fa-broom::before {\n  content: \"\\f51a\"; }\n\n.fa-shield-heart::before {\n  content: \"\\e574\"; }\n\n.fa-gopuram::before {\n  content: \"\\f664\"; }\n\n.fa-earth-oceania::before {\n  content: \"\\e47b\"; }\n\n.fa-globe-oceania::before {\n  content: \"\\e47b\"; }\n\n.fa-square-xmark::before {\n  content: \"\\f2d3\"; }\n\n.fa-times-square::before {\n  content: \"\\f2d3\"; }\n\n.fa-xmark-square::before {\n  content: \"\\f2d3\"; }\n\n.fa-hashtag::before {\n  content: \"\\23\"; }\n\n.fa-up-right-and-down-left-from-center::before {\n  content: \"\\f424\"; }\n\n.fa-expand-alt::before {\n  content: \"\\f424\"; }\n\n.fa-oil-can::before {\n  content: \"\\f613\"; }\n\n.fa-t::before {\n  content: \"\\54\"; }\n\n.fa-hippo::before {\n  content: \"\\f6ed\"; }\n\n.fa-chart-column::before {\n  content: \"\\e0e3\"; }\n\n.fa-infinity::before {\n  content: \"\\f534\"; }\n\n.fa-vial-circle-check::before {\n  content: \"\\e596\"; }\n\n.fa-person-arrow-down-to-line::before {\n  content: \"\\e538\"; }\n\n.fa-voicemail::before {\n  content: \"\\f897\"; }\n\n.fa-fan::before {\n  content: \"\\f863\"; }\n\n.fa-person-walking-luggage::before {\n  content: \"\\e554\"; }\n\n.fa-up-down::before {\n  content: \"\\f338\"; }\n\n.fa-arrows-alt-v::before {\n  content: \"\\f338\"; }\n\n.fa-cloud-moon-rain::before {\n  content: \"\\f73c\"; }\n\n.fa-calendar::before {\n  content: \"\\f133\"; }\n\n.fa-trailer::before {\n  content: \"\\e041\"; }\n\n.fa-bahai::before {\n  content: \"\\f666\"; }\n\n.fa-haykal::before {\n  content: \"\\f666\"; }\n\n.fa-sd-card::before {\n  content: \"\\f7c2\"; }\n\n.fa-dragon::before {\n  content: \"\\f6d5\"; }\n\n.fa-shoe-prints::before {\n  content: \"\\f54b\"; }\n\n.fa-circle-plus::before {\n  content: \"\\f055\"; }\n\n.fa-plus-circle::before {\n  content: \"\\f055\"; }\n\n.fa-face-grin-tongue-wink::before {\n  content: \"\\f58b\"; }\n\n.fa-grin-tongue-wink::before {\n  content: \"\\f58b\"; }\n\n.fa-hand-holding::before {\n  content: \"\\f4bd\"; }\n\n.fa-plug-circle-exclamation::before {\n  content: \"\\e55d\"; }\n\n.fa-link-slash::before {\n  content: \"\\f127\"; }\n\n.fa-chain-broken::before {\n  content: \"\\f127\"; }\n\n.fa-chain-slash::before {\n  content: \"\\f127\"; }\n\n.fa-unlink::before {\n  content: \"\\f127\"; }\n\n.fa-clone::before {\n  content: \"\\f24d\"; }\n\n.fa-person-walking-arrow-loop-left::before {\n  content: \"\\e551\"; }\n\n.fa-arrow-up-z-a::before {\n  content: \"\\f882\"; }\n\n.fa-sort-alpha-up-alt::before {\n  content: \"\\f882\"; }\n\n.fa-fire-flame-curved::before {\n  content: \"\\f7e4\"; }\n\n.fa-fire-alt::before {\n  content: \"\\f7e4\"; }\n\n.fa-tornado::before {\n  content: \"\\f76f\"; }\n\n.fa-file-circle-plus::before {\n  content: \"\\e494\"; }\n\n.fa-book-quran::before {\n  content: \"\\f687\"; }\n\n.fa-quran::before {\n  content: \"\\f687\"; }\n\n.fa-anchor::before {\n  content: \"\\f13d\"; }\n\n.fa-border-all::before {\n  content: \"\\f84c\"; }\n\n.fa-face-angry::before {\n  content: \"\\f556\"; }\n\n.fa-angry::before {\n  content: \"\\f556\"; }\n\n.fa-cookie-bite::before {\n  content: \"\\f564\"; }\n\n.fa-arrow-trend-down::before {\n  content: \"\\e097\"; }\n\n.fa-rss::before {\n  content: \"\\f09e\"; }\n\n.fa-feed::before {\n  content: \"\\f09e\"; }\n\n.fa-draw-polygon::before {\n  content: \"\\f5ee\"; }\n\n.fa-scale-balanced::before {\n  content: \"\\f24e\"; }\n\n.fa-balance-scale::before {\n  content: \"\\f24e\"; }\n\n.fa-gauge-simple-high::before {\n  content: \"\\f62a\"; }\n\n.fa-tachometer::before {\n  content: \"\\f62a\"; }\n\n.fa-tachometer-fast::before {\n  content: \"\\f62a\"; }\n\n.fa-shower::before {\n  content: \"\\f2cc\"; }\n\n.fa-desktop::before {\n  content: \"\\f390\"; }\n\n.fa-desktop-alt::before {\n  content: \"\\f390\"; }\n\n.fa-m::before {\n  content: \"\\4d\"; }\n\n.fa-table-list::before {\n  content: \"\\f00b\"; }\n\n.fa-th-list::before {\n  content: \"\\f00b\"; }\n\n.fa-comment-sms::before {\n  content: \"\\f7cd\"; }\n\n.fa-sms::before {\n  content: \"\\f7cd\"; }\n\n.fa-book::before {\n  content: \"\\f02d\"; }\n\n.fa-user-plus::before {\n  content: \"\\f234\"; }\n\n.fa-check::before {\n  content: \"\\f00c\"; }\n\n.fa-battery-three-quarters::before {\n  content: \"\\f241\"; }\n\n.fa-battery-4::before {\n  content: \"\\f241\"; }\n\n.fa-house-circle-check::before {\n  content: \"\\e509\"; }\n\n.fa-angle-left::before {\n  content: \"\\f104\"; }\n\n.fa-diagram-successor::before {\n  content: \"\\e47a\"; }\n\n.fa-truck-arrow-right::before {\n  content: \"\\e58b\"; }\n\n.fa-arrows-split-up-and-left::before {\n  content: \"\\e4bc\"; }\n\n.fa-hand-fist::before {\n  content: \"\\f6de\"; }\n\n.fa-fist-raised::before {\n  content: \"\\f6de\"; }\n\n.fa-cloud-moon::before {\n  content: \"\\f6c3\"; }\n\n.fa-briefcase::before {\n  content: \"\\f0b1\"; }\n\n.fa-person-falling::before {\n  content: \"\\e546\"; }\n\n.fa-image-portrait::before {\n  content: \"\\f3e0\"; }\n\n.fa-portrait::before {\n  content: \"\\f3e0\"; }\n\n.fa-user-tag::before {\n  content: \"\\f507\"; }\n\n.fa-rug::before {\n  content: \"\\e569\"; }\n\n.fa-earth-europe::before {\n  content: \"\\f7a2\"; }\n\n.fa-globe-europe::before {\n  content: \"\\f7a2\"; }\n\n.fa-cart-flatbed-suitcase::before {\n  content: \"\\f59d\"; }\n\n.fa-luggage-cart::before {\n  content: \"\\f59d\"; }\n\n.fa-rectangle-xmark::before {\n  content: \"\\f410\"; }\n\n.fa-rectangle-times::before {\n  content: \"\\f410\"; }\n\n.fa-times-rectangle::before {\n  content: \"\\f410\"; }\n\n.fa-window-close::before {\n  content: \"\\f410\"; }\n\n.fa-baht-sign::before {\n  content: \"\\e0ac\"; }\n\n.fa-book-open::before {\n  content: \"\\f518\"; }\n\n.fa-book-journal-whills::before {\n  content: \"\\f66a\"; }\n\n.fa-journal-whills::before {\n  content: \"\\f66a\"; }\n\n.fa-handcuffs::before {\n  content: \"\\e4f8\"; }\n\n.fa-triangle-exclamation::before {\n  content: \"\\f071\"; }\n\n.fa-exclamation-triangle::before {\n  content: \"\\f071\"; }\n\n.fa-warning::before {\n  content: \"\\f071\"; }\n\n.fa-database::before {\n  content: \"\\f1c0\"; }\n\n.fa-share::before {\n  content: \"\\f064\"; }\n\n.fa-arrow-turn-right::before {\n  content: \"\\f064\"; }\n\n.fa-mail-forward::before {\n  content: \"\\f064\"; }\n\n.fa-bottle-droplet::before {\n  content: \"\\e4c4\"; }\n\n.fa-mask-face::before {\n  content: \"\\e1d7\"; }\n\n.fa-hill-rockslide::before {\n  content: \"\\e508\"; }\n\n.fa-right-left::before {\n  content: \"\\f362\"; }\n\n.fa-exchange-alt::before {\n  content: \"\\f362\"; }\n\n.fa-paper-plane::before {\n  content: \"\\f1d8\"; }\n\n.fa-road-circle-exclamation::before {\n  content: \"\\e565\"; }\n\n.fa-dungeon::before {\n  content: \"\\f6d9\"; }\n\n.fa-align-right::before {\n  content: \"\\f038\"; }\n\n.fa-money-bill-1-wave::before {\n  content: \"\\f53b\"; }\n\n.fa-money-bill-wave-alt::before {\n  content: \"\\f53b\"; }\n\n.fa-life-ring::before {\n  content: \"\\f1cd\"; }\n\n.fa-hands::before {\n  content: \"\\f2a7\"; }\n\n.fa-sign-language::before {\n  content: \"\\f2a7\"; }\n\n.fa-signing::before {\n  content: \"\\f2a7\"; }\n\n.fa-calendar-day::before {\n  content: \"\\f783\"; }\n\n.fa-water-ladder::before {\n  content: \"\\f5c5\"; }\n\n.fa-ladder-water::before {\n  content: \"\\f5c5\"; }\n\n.fa-swimming-pool::before {\n  content: \"\\f5c5\"; }\n\n.fa-arrows-up-down::before {\n  content: \"\\f07d\"; }\n\n.fa-arrows-v::before {\n  content: \"\\f07d\"; }\n\n.fa-face-grimace::before {\n  content: \"\\f57f\"; }\n\n.fa-grimace::before {\n  content: \"\\f57f\"; }\n\n.fa-wheelchair-move::before {\n  content: \"\\e2ce\"; }\n\n.fa-wheelchair-alt::before {\n  content: \"\\e2ce\"; }\n\n.fa-turn-down::before {\n  content: \"\\f3be\"; }\n\n.fa-level-down-alt::before {\n  content: \"\\f3be\"; }\n\n.fa-person-walking-arrow-right::before {\n  content: \"\\e552\"; }\n\n.fa-square-envelope::before {\n  content: \"\\f199\"; }\n\n.fa-envelope-square::before {\n  content: \"\\f199\"; }\n\n.fa-dice::before {\n  content: \"\\f522\"; }\n\n.fa-bowling-ball::before {\n  content: \"\\f436\"; }\n\n.fa-brain::before {\n  content: \"\\f5dc\"; }\n\n.fa-bandage::before {\n  content: \"\\f462\"; }\n\n.fa-band-aid::before {\n  content: \"\\f462\"; }\n\n.fa-calendar-minus::before {\n  content: \"\\f272\"; }\n\n.fa-circle-xmark::before {\n  content: \"\\f057\"; }\n\n.fa-times-circle::before {\n  content: \"\\f057\"; }\n\n.fa-xmark-circle::before {\n  content: \"\\f057\"; }\n\n.fa-gifts::before {\n  content: \"\\f79c\"; }\n\n.fa-hotel::before {\n  content: \"\\f594\"; }\n\n.fa-earth-asia::before {\n  content: \"\\f57e\"; }\n\n.fa-globe-asia::before {\n  content: \"\\f57e\"; }\n\n.fa-id-card-clip::before {\n  content: \"\\f47f\"; }\n\n.fa-id-card-alt::before {\n  content: \"\\f47f\"; }\n\n.fa-magnifying-glass-plus::before {\n  content: \"\\f00e\"; }\n\n.fa-search-plus::before {\n  content: \"\\f00e\"; }\n\n.fa-thumbs-up::before {\n  content: \"\\f164\"; }\n\n.fa-user-clock::before {\n  content: \"\\f4fd\"; }\n\n.fa-hand-dots::before {\n  content: \"\\f461\"; }\n\n.fa-allergies::before {\n  content: \"\\f461\"; }\n\n.fa-file-invoice::before {\n  content: \"\\f570\"; }\n\n.fa-window-minimize::before {\n  content: \"\\f2d1\"; }\n\n.fa-mug-saucer::before {\n  content: \"\\f0f4\"; }\n\n.fa-coffee::before {\n  content: \"\\f0f4\"; }\n\n.fa-brush::before {\n  content: \"\\f55d\"; }\n\n.fa-mask::before {\n  content: \"\\f6fa\"; }\n\n.fa-magnifying-glass-minus::before {\n  content: \"\\f010\"; }\n\n.fa-search-minus::before {\n  content: \"\\f010\"; }\n\n.fa-ruler-vertical::before {\n  content: \"\\f548\"; }\n\n.fa-user-large::before {\n  content: \"\\f406\"; }\n\n.fa-user-alt::before {\n  content: \"\\f406\"; }\n\n.fa-train-tram::before {\n  content: \"\\e5b4\"; }\n\n.fa-user-nurse::before {\n  content: \"\\f82f\"; }\n\n.fa-syringe::before {\n  content: \"\\f48e\"; }\n\n.fa-cloud-sun::before {\n  content: \"\\f6c4\"; }\n\n.fa-stopwatch-20::before {\n  content: \"\\e06f\"; }\n\n.fa-square-full::before {\n  content: \"\\f45c\"; }\n\n.fa-magnet::before {\n  content: \"\\f076\"; }\n\n.fa-jar::before {\n  content: \"\\e516\"; }\n\n.fa-note-sticky::before {\n  content: \"\\f249\"; }\n\n.fa-sticky-note::before {\n  content: \"\\f249\"; }\n\n.fa-bug-slash::before {\n  content: \"\\e490\"; }\n\n.fa-arrow-up-from-water-pump::before {\n  content: \"\\e4b6\"; }\n\n.fa-bone::before {\n  content: \"\\f5d7\"; }\n\n.fa-user-injured::before {\n  content: \"\\f728\"; }\n\n.fa-face-sad-tear::before {\n  content: \"\\f5b4\"; }\n\n.fa-sad-tear::before {\n  content: \"\\f5b4\"; }\n\n.fa-plane::before {\n  content: \"\\f072\"; }\n\n.fa-tent-arrows-down::before {\n  content: \"\\e581\"; }\n\n.fa-exclamation::before {\n  content: \"\\21\"; }\n\n.fa-arrows-spin::before {\n  content: \"\\e4bb\"; }\n\n.fa-print::before {\n  content: \"\\f02f\"; }\n\n.fa-turkish-lira-sign::before {\n  content: \"\\e2bb\"; }\n\n.fa-try::before {\n  content: \"\\e2bb\"; }\n\n.fa-turkish-lira::before {\n  content: \"\\e2bb\"; }\n\n.fa-dollar-sign::before {\n  content: \"\\24\"; }\n\n.fa-dollar::before {\n  content: \"\\24\"; }\n\n.fa-usd::before {\n  content: \"\\24\"; }\n\n.fa-x::before {\n  content: \"\\58\"; }\n\n.fa-magnifying-glass-dollar::before {\n  content: \"\\f688\"; }\n\n.fa-search-dollar::before {\n  content: \"\\f688\"; }\n\n.fa-users-gear::before {\n  content: \"\\f509\"; }\n\n.fa-users-cog::before {\n  content: \"\\f509\"; }\n\n.fa-person-military-pointing::before {\n  content: \"\\e54a\"; }\n\n.fa-building-columns::before {\n  content: \"\\f19c\"; }\n\n.fa-bank::before {\n  content: \"\\f19c\"; }\n\n.fa-institution::before {\n  content: \"\\f19c\"; }\n\n.fa-museum::before {\n  content: \"\\f19c\"; }\n\n.fa-university::before {\n  content: \"\\f19c\"; }\n\n.fa-umbrella::before {\n  content: \"\\f0e9\"; }\n\n.fa-trowel::before {\n  content: \"\\e589\"; }\n\n.fa-d::before {\n  content: \"\\44\"; }\n\n.fa-stapler::before {\n  content: \"\\e5af\"; }\n\n.fa-masks-theater::before {\n  content: \"\\f630\"; }\n\n.fa-theater-masks::before {\n  content: \"\\f630\"; }\n\n.fa-kip-sign::before {\n  content: \"\\e1c4\"; }\n\n.fa-hand-point-left::before {\n  content: \"\\f0a5\"; }\n\n.fa-handshake-simple::before {\n  content: \"\\f4c6\"; }\n\n.fa-handshake-alt::before {\n  content: \"\\f4c6\"; }\n\n.fa-jet-fighter::before {\n  content: \"\\f0fb\"; }\n\n.fa-fighter-jet::before {\n  content: \"\\f0fb\"; }\n\n.fa-square-share-nodes::before {\n  content: \"\\f1e1\"; }\n\n.fa-share-alt-square::before {\n  content: \"\\f1e1\"; }\n\n.fa-barcode::before {\n  content: \"\\f02a\"; }\n\n.fa-plus-minus::before {\n  content: \"\\e43c\"; }\n\n.fa-video::before {\n  content: \"\\f03d\"; }\n\n.fa-video-camera::before {\n  content: \"\\f03d\"; }\n\n.fa-graduation-cap::before {\n  content: \"\\f19d\"; }\n\n.fa-mortar-board::before {\n  content: \"\\f19d\"; }\n\n.fa-hand-holding-medical::before {\n  content: \"\\e05c\"; }\n\n.fa-person-circle-check::before {\n  content: \"\\e53e\"; }\n\n.fa-turn-up::before {\n  content: \"\\f3bf\"; }\n\n.fa-level-up-alt::before {\n  content: \"\\f3bf\"; }\n\n.sr-only,\n.fa-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0; }\n\n.sr-only-focusable:not(:focus),\n.fa-sr-only-focusable:not(:focus) {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0; }\n:root, :host {\n  --fa-style-family-brands: 'Font Awesome 6 Brands';\n  --fa-font-brands: normal 400 1em/1 'Font Awesome 6 Brands'; }\n\n@font-face {\n  font-family: 'Font Awesome 6 Brands';\n  font-style: normal;\n  font-weight: 400;\n  font-display: block;\n  src: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ") format(\"woff2\"), url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ") format(\"truetype\"); }\n\n.fab,\n.fa-brands {\n  font-weight: 400; }\n\n.fa-monero:before {\n  content: \"\\f3d0\"; }\n\n.fa-hooli:before {\n  content: \"\\f427\"; }\n\n.fa-yelp:before {\n  content: \"\\f1e9\"; }\n\n.fa-cc-visa:before {\n  content: \"\\f1f0\"; }\n\n.fa-lastfm:before {\n  content: \"\\f202\"; }\n\n.fa-shopware:before {\n  content: \"\\f5b5\"; }\n\n.fa-creative-commons-nc:before {\n  content: \"\\f4e8\"; }\n\n.fa-aws:before {\n  content: \"\\f375\"; }\n\n.fa-redhat:before {\n  content: \"\\f7bc\"; }\n\n.fa-yoast:before {\n  content: \"\\f2b1\"; }\n\n.fa-cloudflare:before {\n  content: \"\\e07d\"; }\n\n.fa-ups:before {\n  content: \"\\f7e0\"; }\n\n.fa-wpexplorer:before {\n  content: \"\\f2de\"; }\n\n.fa-dyalog:before {\n  content: \"\\f399\"; }\n\n.fa-bity:before {\n  content: \"\\f37a\"; }\n\n.fa-stackpath:before {\n  content: \"\\f842\"; }\n\n.fa-buysellads:before {\n  content: \"\\f20d\"; }\n\n.fa-first-order:before {\n  content: \"\\f2b0\"; }\n\n.fa-modx:before {\n  content: \"\\f285\"; }\n\n.fa-guilded:before {\n  content: \"\\e07e\"; }\n\n.fa-vnv:before {\n  content: \"\\f40b\"; }\n\n.fa-square-js:before {\n  content: \"\\f3b9\"; }\n\n.fa-js-square:before {\n  content: \"\\f3b9\"; }\n\n.fa-microsoft:before {\n  content: \"\\f3ca\"; }\n\n.fa-qq:before {\n  content: \"\\f1d6\"; }\n\n.fa-orcid:before {\n  content: \"\\f8d2\"; }\n\n.fa-java:before {\n  content: \"\\f4e4\"; }\n\n.fa-invision:before {\n  content: \"\\f7b0\"; }\n\n.fa-creative-commons-pd-alt:before {\n  content: \"\\f4ed\"; }\n\n.fa-centercode:before {\n  content: \"\\f380\"; }\n\n.fa-glide-g:before {\n  content: \"\\f2a6\"; }\n\n.fa-drupal:before {\n  content: \"\\f1a9\"; }\n\n.fa-hire-a-helper:before {\n  content: \"\\f3b0\"; }\n\n.fa-creative-commons-by:before {\n  content: \"\\f4e7\"; }\n\n.fa-unity:before {\n  content: \"\\e049\"; }\n\n.fa-whmcs:before {\n  content: \"\\f40d\"; }\n\n.fa-rocketchat:before {\n  content: \"\\f3e8\"; }\n\n.fa-vk:before {\n  content: \"\\f189\"; }\n\n.fa-untappd:before {\n  content: \"\\f405\"; }\n\n.fa-mailchimp:before {\n  content: \"\\f59e\"; }\n\n.fa-css3-alt:before {\n  content: \"\\f38b\"; }\n\n.fa-square-reddit:before {\n  content: \"\\f1a2\"; }\n\n.fa-reddit-square:before {\n  content: \"\\f1a2\"; }\n\n.fa-vimeo-v:before {\n  content: \"\\f27d\"; }\n\n.fa-contao:before {\n  content: \"\\f26d\"; }\n\n.fa-square-font-awesome:before {\n  content: \"\\e5ad\"; }\n\n.fa-deskpro:before {\n  content: \"\\f38f\"; }\n\n.fa-sistrix:before {\n  content: \"\\f3ee\"; }\n\n.fa-square-instagram:before {\n  content: \"\\e055\"; }\n\n.fa-instagram-square:before {\n  content: \"\\e055\"; }\n\n.fa-battle-net:before {\n  content: \"\\f835\"; }\n\n.fa-the-red-yeti:before {\n  content: \"\\f69d\"; }\n\n.fa-square-hacker-news:before {\n  content: \"\\f3af\"; }\n\n.fa-hacker-news-square:before {\n  content: \"\\f3af\"; }\n\n.fa-edge:before {\n  content: \"\\f282\"; }\n\n.fa-threads:before {\n  content: \"\\e618\"; }\n\n.fa-napster:before {\n  content: \"\\f3d2\"; }\n\n.fa-square-snapchat:before {\n  content: \"\\f2ad\"; }\n\n.fa-snapchat-square:before {\n  content: \"\\f2ad\"; }\n\n.fa-google-plus-g:before {\n  content: \"\\f0d5\"; }\n\n.fa-artstation:before {\n  content: \"\\f77a\"; }\n\n.fa-markdown:before {\n  content: \"\\f60f\"; }\n\n.fa-sourcetree:before {\n  content: \"\\f7d3\"; }\n\n.fa-google-plus:before {\n  content: \"\\f2b3\"; }\n\n.fa-diaspora:before {\n  content: \"\\f791\"; }\n\n.fa-foursquare:before {\n  content: \"\\f180\"; }\n\n.fa-stack-overflow:before {\n  content: \"\\f16c\"; }\n\n.fa-github-alt:before {\n  content: \"\\f113\"; }\n\n.fa-phoenix-squadron:before {\n  content: \"\\f511\"; }\n\n.fa-pagelines:before {\n  content: \"\\f18c\"; }\n\n.fa-algolia:before {\n  content: \"\\f36c\"; }\n\n.fa-red-river:before {\n  content: \"\\f3e3\"; }\n\n.fa-creative-commons-sa:before {\n  content: \"\\f4ef\"; }\n\n.fa-safari:before {\n  content: \"\\f267\"; }\n\n.fa-google:before {\n  content: \"\\f1a0\"; }\n\n.fa-square-font-awesome-stroke:before {\n  content: \"\\f35c\"; }\n\n.fa-font-awesome-alt:before {\n  content: \"\\f35c\"; }\n\n.fa-atlassian:before {\n  content: \"\\f77b\"; }\n\n.fa-linkedin-in:before {\n  content: \"\\f0e1\"; }\n\n.fa-digital-ocean:before {\n  content: \"\\f391\"; }\n\n.fa-nimblr:before {\n  content: \"\\f5a8\"; }\n\n.fa-chromecast:before {\n  content: \"\\f838\"; }\n\n.fa-evernote:before {\n  content: \"\\f839\"; }\n\n.fa-hacker-news:before {\n  content: \"\\f1d4\"; }\n\n.fa-creative-commons-sampling:before {\n  content: \"\\f4f0\"; }\n\n.fa-adversal:before {\n  content: \"\\f36a\"; }\n\n.fa-creative-commons:before {\n  content: \"\\f25e\"; }\n\n.fa-watchman-monitoring:before {\n  content: \"\\e087\"; }\n\n.fa-fonticons:before {\n  content: \"\\f280\"; }\n\n.fa-weixin:before {\n  content: \"\\f1d7\"; }\n\n.fa-shirtsinbulk:before {\n  content: \"\\f214\"; }\n\n.fa-codepen:before {\n  content: \"\\f1cb\"; }\n\n.fa-git-alt:before {\n  content: \"\\f841\"; }\n\n.fa-lyft:before {\n  content: \"\\f3c3\"; }\n\n.fa-rev:before {\n  content: \"\\f5b2\"; }\n\n.fa-windows:before {\n  content: \"\\f17a\"; }\n\n.fa-wizards-of-the-coast:before {\n  content: \"\\f730\"; }\n\n.fa-square-viadeo:before {\n  content: \"\\f2aa\"; }\n\n.fa-viadeo-square:before {\n  content: \"\\f2aa\"; }\n\n.fa-meetup:before {\n  content: \"\\f2e0\"; }\n\n.fa-centos:before {\n  content: \"\\f789\"; }\n\n.fa-adn:before {\n  content: \"\\f170\"; }\n\n.fa-cloudsmith:before {\n  content: \"\\f384\"; }\n\n.fa-pied-piper-alt:before {\n  content: \"\\f1a8\"; }\n\n.fa-square-dribbble:before {\n  content: \"\\f397\"; }\n\n.fa-dribbble-square:before {\n  content: \"\\f397\"; }\n\n.fa-codiepie:before {\n  content: \"\\f284\"; }\n\n.fa-node:before {\n  content: \"\\f419\"; }\n\n.fa-mix:before {\n  content: \"\\f3cb\"; }\n\n.fa-steam:before {\n  content: \"\\f1b6\"; }\n\n.fa-cc-apple-pay:before {\n  content: \"\\f416\"; }\n\n.fa-scribd:before {\n  content: \"\\f28a\"; }\n\n.fa-debian:before {\n  content: \"\\e60b\"; }\n\n.fa-openid:before {\n  content: \"\\f19b\"; }\n\n.fa-instalod:before {\n  content: \"\\e081\"; }\n\n.fa-expeditedssl:before {\n  content: \"\\f23e\"; }\n\n.fa-sellcast:before {\n  content: \"\\f2da\"; }\n\n.fa-square-twitter:before {\n  content: \"\\f081\"; }\n\n.fa-twitter-square:before {\n  content: \"\\f081\"; }\n\n.fa-r-project:before {\n  content: \"\\f4f7\"; }\n\n.fa-delicious:before {\n  content: \"\\f1a5\"; }\n\n.fa-freebsd:before {\n  content: \"\\f3a4\"; }\n\n.fa-vuejs:before {\n  content: \"\\f41f\"; }\n\n.fa-accusoft:before {\n  content: \"\\f369\"; }\n\n.fa-ioxhost:before {\n  content: \"\\f208\"; }\n\n.fa-fonticons-fi:before {\n  content: \"\\f3a2\"; }\n\n.fa-app-store:before {\n  content: \"\\f36f\"; }\n\n.fa-cc-mastercard:before {\n  content: \"\\f1f1\"; }\n\n.fa-itunes-note:before {\n  content: \"\\f3b5\"; }\n\n.fa-golang:before {\n  content: \"\\e40f\"; }\n\n.fa-kickstarter:before {\n  content: \"\\f3bb\"; }\n\n.fa-grav:before {\n  content: \"\\f2d6\"; }\n\n.fa-weibo:before {\n  content: \"\\f18a\"; }\n\n.fa-uncharted:before {\n  content: \"\\e084\"; }\n\n.fa-firstdraft:before {\n  content: \"\\f3a1\"; }\n\n.fa-square-youtube:before {\n  content: \"\\f431\"; }\n\n.fa-youtube-square:before {\n  content: \"\\f431\"; }\n\n.fa-wikipedia-w:before {\n  content: \"\\f266\"; }\n\n.fa-wpressr:before {\n  content: \"\\f3e4\"; }\n\n.fa-rendact:before {\n  content: \"\\f3e4\"; }\n\n.fa-angellist:before {\n  content: \"\\f209\"; }\n\n.fa-galactic-republic:before {\n  content: \"\\f50c\"; }\n\n.fa-nfc-directional:before {\n  content: \"\\e530\"; }\n\n.fa-skype:before {\n  content: \"\\f17e\"; }\n\n.fa-joget:before {\n  content: \"\\f3b7\"; }\n\n.fa-fedora:before {\n  content: \"\\f798\"; }\n\n.fa-stripe-s:before {\n  content: \"\\f42a\"; }\n\n.fa-meta:before {\n  content: \"\\e49b\"; }\n\n.fa-laravel:before {\n  content: \"\\f3bd\"; }\n\n.fa-hotjar:before {\n  content: \"\\f3b1\"; }\n\n.fa-bluetooth-b:before {\n  content: \"\\f294\"; }\n\n.fa-sticker-mule:before {\n  content: \"\\f3f7\"; }\n\n.fa-creative-commons-zero:before {\n  content: \"\\f4f3\"; }\n\n.fa-hips:before {\n  content: \"\\f452\"; }\n\n.fa-behance:before {\n  content: \"\\f1b4\"; }\n\n.fa-reddit:before {\n  content: \"\\f1a1\"; }\n\n.fa-discord:before {\n  content: \"\\f392\"; }\n\n.fa-chrome:before {\n  content: \"\\f268\"; }\n\n.fa-app-store-ios:before {\n  content: \"\\f370\"; }\n\n.fa-cc-discover:before {\n  content: \"\\f1f2\"; }\n\n.fa-wpbeginner:before {\n  content: \"\\f297\"; }\n\n.fa-confluence:before {\n  content: \"\\f78d\"; }\n\n.fa-mdb:before {\n  content: \"\\f8ca\"; }\n\n.fa-dochub:before {\n  content: \"\\f394\"; }\n\n.fa-accessible-icon:before {\n  content: \"\\f368\"; }\n\n.fa-ebay:before {\n  content: \"\\f4f4\"; }\n\n.fa-amazon:before {\n  content: \"\\f270\"; }\n\n.fa-unsplash:before {\n  content: \"\\e07c\"; }\n\n.fa-yarn:before {\n  content: \"\\f7e3\"; }\n\n.fa-square-steam:before {\n  content: \"\\f1b7\"; }\n\n.fa-steam-square:before {\n  content: \"\\f1b7\"; }\n\n.fa-500px:before {\n  content: \"\\f26e\"; }\n\n.fa-square-vimeo:before {\n  content: \"\\f194\"; }\n\n.fa-vimeo-square:before {\n  content: \"\\f194\"; }\n\n.fa-asymmetrik:before {\n  content: \"\\f372\"; }\n\n.fa-font-awesome:before {\n  content: \"\\f2b4\"; }\n\n.fa-font-awesome-flag:before {\n  content: \"\\f2b4\"; }\n\n.fa-font-awesome-logo-full:before {\n  content: \"\\f2b4\"; }\n\n.fa-gratipay:before {\n  content: \"\\f184\"; }\n\n.fa-apple:before {\n  content: \"\\f179\"; }\n\n.fa-hive:before {\n  content: \"\\e07f\"; }\n\n.fa-gitkraken:before {\n  content: \"\\f3a6\"; }\n\n.fa-keybase:before {\n  content: \"\\f4f5\"; }\n\n.fa-apple-pay:before {\n  content: \"\\f415\"; }\n\n.fa-padlet:before {\n  content: \"\\e4a0\"; }\n\n.fa-amazon-pay:before {\n  content: \"\\f42c\"; }\n\n.fa-square-github:before {\n  content: \"\\f092\"; }\n\n.fa-github-square:before {\n  content: \"\\f092\"; }\n\n.fa-stumbleupon:before {\n  content: \"\\f1a4\"; }\n\n.fa-fedex:before {\n  content: \"\\f797\"; }\n\n.fa-phoenix-framework:before {\n  content: \"\\f3dc\"; }\n\n.fa-shopify:before {\n  content: \"\\e057\"; }\n\n.fa-neos:before {\n  content: \"\\f612\"; }\n\n.fa-square-threads:before {\n  content: \"\\e619\"; }\n\n.fa-hackerrank:before {\n  content: \"\\f5f7\"; }\n\n.fa-researchgate:before {\n  content: \"\\f4f8\"; }\n\n.fa-swift:before {\n  content: \"\\f8e1\"; }\n\n.fa-angular:before {\n  content: \"\\f420\"; }\n\n.fa-speakap:before {\n  content: \"\\f3f3\"; }\n\n.fa-angrycreative:before {\n  content: \"\\f36e\"; }\n\n.fa-y-combinator:before {\n  content: \"\\f23b\"; }\n\n.fa-empire:before {\n  content: \"\\f1d1\"; }\n\n.fa-envira:before {\n  content: \"\\f299\"; }\n\n.fa-square-gitlab:before {\n  content: \"\\e5ae\"; }\n\n.fa-gitlab-square:before {\n  content: \"\\e5ae\"; }\n\n.fa-studiovinari:before {\n  content: \"\\f3f8\"; }\n\n.fa-pied-piper:before {\n  content: \"\\f2ae\"; }\n\n.fa-wordpress:before {\n  content: \"\\f19a\"; }\n\n.fa-product-hunt:before {\n  content: \"\\f288\"; }\n\n.fa-firefox:before {\n  content: \"\\f269\"; }\n\n.fa-linode:before {\n  content: \"\\f2b8\"; }\n\n.fa-goodreads:before {\n  content: \"\\f3a8\"; }\n\n.fa-square-odnoklassniki:before {\n  content: \"\\f264\"; }\n\n.fa-odnoklassniki-square:before {\n  content: \"\\f264\"; }\n\n.fa-jsfiddle:before {\n  content: \"\\f1cc\"; }\n\n.fa-sith:before {\n  content: \"\\f512\"; }\n\n.fa-themeisle:before {\n  content: \"\\f2b2\"; }\n\n.fa-page4:before {\n  content: \"\\f3d7\"; }\n\n.fa-hashnode:before {\n  content: \"\\e499\"; }\n\n.fa-react:before {\n  content: \"\\f41b\"; }\n\n.fa-cc-paypal:before {\n  content: \"\\f1f4\"; }\n\n.fa-squarespace:before {\n  content: \"\\f5be\"; }\n\n.fa-cc-stripe:before {\n  content: \"\\f1f5\"; }\n\n.fa-creative-commons-share:before {\n  content: \"\\f4f2\"; }\n\n.fa-bitcoin:before {\n  content: \"\\f379\"; }\n\n.fa-keycdn:before {\n  content: \"\\f3ba\"; }\n\n.fa-opera:before {\n  content: \"\\f26a\"; }\n\n.fa-itch-io:before {\n  content: \"\\f83a\"; }\n\n.fa-umbraco:before {\n  content: \"\\f8e8\"; }\n\n.fa-galactic-senate:before {\n  content: \"\\f50d\"; }\n\n.fa-ubuntu:before {\n  content: \"\\f7df\"; }\n\n.fa-draft2digital:before {\n  content: \"\\f396\"; }\n\n.fa-stripe:before {\n  content: \"\\f429\"; }\n\n.fa-houzz:before {\n  content: \"\\f27c\"; }\n\n.fa-gg:before {\n  content: \"\\f260\"; }\n\n.fa-dhl:before {\n  content: \"\\f790\"; }\n\n.fa-square-pinterest:before {\n  content: \"\\f0d3\"; }\n\n.fa-pinterest-square:before {\n  content: \"\\f0d3\"; }\n\n.fa-xing:before {\n  content: \"\\f168\"; }\n\n.fa-blackberry:before {\n  content: \"\\f37b\"; }\n\n.fa-creative-commons-pd:before {\n  content: \"\\f4ec\"; }\n\n.fa-playstation:before {\n  content: \"\\f3df\"; }\n\n.fa-quinscape:before {\n  content: \"\\f459\"; }\n\n.fa-less:before {\n  content: \"\\f41d\"; }\n\n.fa-blogger-b:before {\n  content: \"\\f37d\"; }\n\n.fa-opencart:before {\n  content: \"\\f23d\"; }\n\n.fa-vine:before {\n  content: \"\\f1ca\"; }\n\n.fa-paypal:before {\n  content: \"\\f1ed\"; }\n\n.fa-gitlab:before {\n  content: \"\\f296\"; }\n\n.fa-typo3:before {\n  content: \"\\f42b\"; }\n\n.fa-reddit-alien:before {\n  content: \"\\f281\"; }\n\n.fa-yahoo:before {\n  content: \"\\f19e\"; }\n\n.fa-dailymotion:before {\n  content: \"\\e052\"; }\n\n.fa-affiliatetheme:before {\n  content: \"\\f36b\"; }\n\n.fa-pied-piper-pp:before {\n  content: \"\\f1a7\"; }\n\n.fa-bootstrap:before {\n  content: \"\\f836\"; }\n\n.fa-odnoklassniki:before {\n  content: \"\\f263\"; }\n\n.fa-nfc-symbol:before {\n  content: \"\\e531\"; }\n\n.fa-ethereum:before {\n  content: \"\\f42e\"; }\n\n.fa-speaker-deck:before {\n  content: \"\\f83c\"; }\n\n.fa-creative-commons-nc-eu:before {\n  content: \"\\f4e9\"; }\n\n.fa-patreon:before {\n  content: \"\\f3d9\"; }\n\n.fa-avianex:before {\n  content: \"\\f374\"; }\n\n.fa-ello:before {\n  content: \"\\f5f1\"; }\n\n.fa-gofore:before {\n  content: \"\\f3a7\"; }\n\n.fa-bimobject:before {\n  content: \"\\f378\"; }\n\n.fa-facebook-f:before {\n  content: \"\\f39e\"; }\n\n.fa-square-google-plus:before {\n  content: \"\\f0d4\"; }\n\n.fa-google-plus-square:before {\n  content: \"\\f0d4\"; }\n\n.fa-mandalorian:before {\n  content: \"\\f50f\"; }\n\n.fa-first-order-alt:before {\n  content: \"\\f50a\"; }\n\n.fa-osi:before {\n  content: \"\\f41a\"; }\n\n.fa-google-wallet:before {\n  content: \"\\f1ee\"; }\n\n.fa-d-and-d-beyond:before {\n  content: \"\\f6ca\"; }\n\n.fa-periscope:before {\n  content: \"\\f3da\"; }\n\n.fa-fulcrum:before {\n  content: \"\\f50b\"; }\n\n.fa-cloudscale:before {\n  content: \"\\f383\"; }\n\n.fa-forumbee:before {\n  content: \"\\f211\"; }\n\n.fa-mizuni:before {\n  content: \"\\f3cc\"; }\n\n.fa-schlix:before {\n  content: \"\\f3ea\"; }\n\n.fa-square-xing:before {\n  content: \"\\f169\"; }\n\n.fa-xing-square:before {\n  content: \"\\f169\"; }\n\n.fa-bandcamp:before {\n  content: \"\\f2d5\"; }\n\n.fa-wpforms:before {\n  content: \"\\f298\"; }\n\n.fa-cloudversify:before {\n  content: \"\\f385\"; }\n\n.fa-usps:before {\n  content: \"\\f7e1\"; }\n\n.fa-megaport:before {\n  content: \"\\f5a3\"; }\n\n.fa-magento:before {\n  content: \"\\f3c4\"; }\n\n.fa-spotify:before {\n  content: \"\\f1bc\"; }\n\n.fa-optin-monster:before {\n  content: \"\\f23c\"; }\n\n.fa-fly:before {\n  content: \"\\f417\"; }\n\n.fa-aviato:before {\n  content: \"\\f421\"; }\n\n.fa-itunes:before {\n  content: \"\\f3b4\"; }\n\n.fa-cuttlefish:before {\n  content: \"\\f38c\"; }\n\n.fa-blogger:before {\n  content: \"\\f37c\"; }\n\n.fa-flickr:before {\n  content: \"\\f16e\"; }\n\n.fa-viber:before {\n  content: \"\\f409\"; }\n\n.fa-soundcloud:before {\n  content: \"\\f1be\"; }\n\n.fa-digg:before {\n  content: \"\\f1a6\"; }\n\n.fa-tencent-weibo:before {\n  content: \"\\f1d5\"; }\n\n.fa-symfony:before {\n  content: \"\\f83d\"; }\n\n.fa-maxcdn:before {\n  content: \"\\f136\"; }\n\n.fa-etsy:before {\n  content: \"\\f2d7\"; }\n\n.fa-facebook-messenger:before {\n  content: \"\\f39f\"; }\n\n.fa-audible:before {\n  content: \"\\f373\"; }\n\n.fa-think-peaks:before {\n  content: \"\\f731\"; }\n\n.fa-bilibili:before {\n  content: \"\\e3d9\"; }\n\n.fa-erlang:before {\n  content: \"\\f39d\"; }\n\n.fa-x-twitter:before {\n  content: \"\\e61b\"; }\n\n.fa-cotton-bureau:before {\n  content: \"\\f89e\"; }\n\n.fa-dashcube:before {\n  content: \"\\f210\"; }\n\n.fa-42-group:before {\n  content: \"\\e080\"; }\n\n.fa-innosoft:before {\n  content: \"\\e080\"; }\n\n.fa-stack-exchange:before {\n  content: \"\\f18d\"; }\n\n.fa-elementor:before {\n  content: \"\\f430\"; }\n\n.fa-square-pied-piper:before {\n  content: \"\\e01e\"; }\n\n.fa-pied-piper-square:before {\n  content: \"\\e01e\"; }\n\n.fa-creative-commons-nd:before {\n  content: \"\\f4eb\"; }\n\n.fa-palfed:before {\n  content: \"\\f3d8\"; }\n\n.fa-superpowers:before {\n  content: \"\\f2dd\"; }\n\n.fa-resolving:before {\n  content: \"\\f3e7\"; }\n\n.fa-xbox:before {\n  content: \"\\f412\"; }\n\n.fa-searchengin:before {\n  content: \"\\f3eb\"; }\n\n.fa-tiktok:before {\n  content: \"\\e07b\"; }\n\n.fa-square-facebook:before {\n  content: \"\\f082\"; }\n\n.fa-facebook-square:before {\n  content: \"\\f082\"; }\n\n.fa-renren:before {\n  content: \"\\f18b\"; }\n\n.fa-linux:before {\n  content: \"\\f17c\"; }\n\n.fa-glide:before {\n  content: \"\\f2a5\"; }\n\n.fa-linkedin:before {\n  content: \"\\f08c\"; }\n\n.fa-hubspot:before {\n  content: \"\\f3b2\"; }\n\n.fa-deploydog:before {\n  content: \"\\f38e\"; }\n\n.fa-twitch:before {\n  content: \"\\f1e8\"; }\n\n.fa-ravelry:before {\n  content: \"\\f2d9\"; }\n\n.fa-mixer:before {\n  content: \"\\e056\"; }\n\n.fa-square-lastfm:before {\n  content: \"\\f203\"; }\n\n.fa-lastfm-square:before {\n  content: \"\\f203\"; }\n\n.fa-vimeo:before {\n  content: \"\\f40a\"; }\n\n.fa-mendeley:before {\n  content: \"\\f7b3\"; }\n\n.fa-uniregistry:before {\n  content: \"\\f404\"; }\n\n.fa-figma:before {\n  content: \"\\f799\"; }\n\n.fa-creative-commons-remix:before {\n  content: \"\\f4ee\"; }\n\n.fa-cc-amazon-pay:before {\n  content: \"\\f42d\"; }\n\n.fa-dropbox:before {\n  content: \"\\f16b\"; }\n\n.fa-instagram:before {\n  content: \"\\f16d\"; }\n\n.fa-cmplid:before {\n  content: \"\\e360\"; }\n\n.fa-facebook:before {\n  content: \"\\f09a\"; }\n\n.fa-gripfire:before {\n  content: \"\\f3ac\"; }\n\n.fa-jedi-order:before {\n  content: \"\\f50e\"; }\n\n.fa-uikit:before {\n  content: \"\\f403\"; }\n\n.fa-fort-awesome-alt:before {\n  content: \"\\f3a3\"; }\n\n.fa-phabricator:before {\n  content: \"\\f3db\"; }\n\n.fa-ussunnah:before {\n  content: \"\\f407\"; }\n\n.fa-earlybirds:before {\n  content: \"\\f39a\"; }\n\n.fa-trade-federation:before {\n  content: \"\\f513\"; }\n\n.fa-autoprefixer:before {\n  content: \"\\f41c\"; }\n\n.fa-whatsapp:before {\n  content: \"\\f232\"; }\n\n.fa-slideshare:before {\n  content: \"\\f1e7\"; }\n\n.fa-google-play:before {\n  content: \"\\f3ab\"; }\n\n.fa-viadeo:before {\n  content: \"\\f2a9\"; }\n\n.fa-line:before {\n  content: \"\\f3c0\"; }\n\n.fa-google-drive:before {\n  content: \"\\f3aa\"; }\n\n.fa-servicestack:before {\n  content: \"\\f3ec\"; }\n\n.fa-simplybuilt:before {\n  content: \"\\f215\"; }\n\n.fa-bitbucket:before {\n  content: \"\\f171\"; }\n\n.fa-imdb:before {\n  content: \"\\f2d8\"; }\n\n.fa-deezer:before {\n  content: \"\\e077\"; }\n\n.fa-raspberry-pi:before {\n  content: \"\\f7bb\"; }\n\n.fa-jira:before {\n  content: \"\\f7b1\"; }\n\n.fa-docker:before {\n  content: \"\\f395\"; }\n\n.fa-screenpal:before {\n  content: \"\\e570\"; }\n\n.fa-bluetooth:before {\n  content: \"\\f293\"; }\n\n.fa-gitter:before {\n  content: \"\\f426\"; }\n\n.fa-d-and-d:before {\n  content: \"\\f38d\"; }\n\n.fa-microblog:before {\n  content: \"\\e01a\"; }\n\n.fa-cc-diners-club:before {\n  content: \"\\f24c\"; }\n\n.fa-gg-circle:before {\n  content: \"\\f261\"; }\n\n.fa-pied-piper-hat:before {\n  content: \"\\f4e5\"; }\n\n.fa-kickstarter-k:before {\n  content: \"\\f3bc\"; }\n\n.fa-yandex:before {\n  content: \"\\f413\"; }\n\n.fa-readme:before {\n  content: \"\\f4d5\"; }\n\n.fa-html5:before {\n  content: \"\\f13b\"; }\n\n.fa-sellsy:before {\n  content: \"\\f213\"; }\n\n.fa-sass:before {\n  content: \"\\f41e\"; }\n\n.fa-wirsindhandwerk:before {\n  content: \"\\e2d0\"; }\n\n.fa-wsh:before {\n  content: \"\\e2d0\"; }\n\n.fa-buromobelexperte:before {\n  content: \"\\f37f\"; }\n\n.fa-salesforce:before {\n  content: \"\\f83b\"; }\n\n.fa-octopus-deploy:before {\n  content: \"\\e082\"; }\n\n.fa-medapps:before {\n  content: \"\\f3c6\"; }\n\n.fa-ns8:before {\n  content: \"\\f3d5\"; }\n\n.fa-pinterest-p:before {\n  content: \"\\f231\"; }\n\n.fa-apper:before {\n  content: \"\\f371\"; }\n\n.fa-fort-awesome:before {\n  content: \"\\f286\"; }\n\n.fa-waze:before {\n  content: \"\\f83f\"; }\n\n.fa-cc-jcb:before {\n  content: \"\\f24b\"; }\n\n.fa-snapchat:before {\n  content: \"\\f2ab\"; }\n\n.fa-snapchat-ghost:before {\n  content: \"\\f2ab\"; }\n\n.fa-fantasy-flight-games:before {\n  content: \"\\f6dc\"; }\n\n.fa-rust:before {\n  content: \"\\e07a\"; }\n\n.fa-wix:before {\n  content: \"\\f5cf\"; }\n\n.fa-square-behance:before {\n  content: \"\\f1b5\"; }\n\n.fa-behance-square:before {\n  content: \"\\f1b5\"; }\n\n.fa-supple:before {\n  content: \"\\f3f9\"; }\n\n.fa-rebel:before {\n  content: \"\\f1d0\"; }\n\n.fa-css3:before {\n  content: \"\\f13c\"; }\n\n.fa-staylinked:before {\n  content: \"\\f3f5\"; }\n\n.fa-kaggle:before {\n  content: \"\\f5fa\"; }\n\n.fa-space-awesome:before {\n  content: \"\\e5ac\"; }\n\n.fa-deviantart:before {\n  content: \"\\f1bd\"; }\n\n.fa-cpanel:before {\n  content: \"\\f388\"; }\n\n.fa-goodreads-g:before {\n  content: \"\\f3a9\"; }\n\n.fa-square-git:before {\n  content: \"\\f1d2\"; }\n\n.fa-git-square:before {\n  content: \"\\f1d2\"; }\n\n.fa-square-tumblr:before {\n  content: \"\\f174\"; }\n\n.fa-tumblr-square:before {\n  content: \"\\f174\"; }\n\n.fa-trello:before {\n  content: \"\\f181\"; }\n\n.fa-creative-commons-nc-jp:before {\n  content: \"\\f4ea\"; }\n\n.fa-get-pocket:before {\n  content: \"\\f265\"; }\n\n.fa-perbyte:before {\n  content: \"\\e083\"; }\n\n.fa-grunt:before {\n  content: \"\\f3ad\"; }\n\n.fa-weebly:before {\n  content: \"\\f5cc\"; }\n\n.fa-connectdevelop:before {\n  content: \"\\f20e\"; }\n\n.fa-leanpub:before {\n  content: \"\\f212\"; }\n\n.fa-black-tie:before {\n  content: \"\\f27e\"; }\n\n.fa-themeco:before {\n  content: \"\\f5c6\"; }\n\n.fa-python:before {\n  content: \"\\f3e2\"; }\n\n.fa-android:before {\n  content: \"\\f17b\"; }\n\n.fa-bots:before {\n  content: \"\\e340\"; }\n\n.fa-free-code-camp:before {\n  content: \"\\f2c5\"; }\n\n.fa-hornbill:before {\n  content: \"\\f592\"; }\n\n.fa-js:before {\n  content: \"\\f3b8\"; }\n\n.fa-ideal:before {\n  content: \"\\e013\"; }\n\n.fa-git:before {\n  content: \"\\f1d3\"; }\n\n.fa-dev:before {\n  content: \"\\f6cc\"; }\n\n.fa-sketch:before {\n  content: \"\\f7c6\"; }\n\n.fa-yandex-international:before {\n  content: \"\\f414\"; }\n\n.fa-cc-amex:before {\n  content: \"\\f1f3\"; }\n\n.fa-uber:before {\n  content: \"\\f402\"; }\n\n.fa-github:before {\n  content: \"\\f09b\"; }\n\n.fa-php:before {\n  content: \"\\f457\"; }\n\n.fa-alipay:before {\n  content: \"\\f642\"; }\n\n.fa-youtube:before {\n  content: \"\\f167\"; }\n\n.fa-skyatlas:before {\n  content: \"\\f216\"; }\n\n.fa-firefox-browser:before {\n  content: \"\\e007\"; }\n\n.fa-replyd:before {\n  content: \"\\f3e6\"; }\n\n.fa-suse:before {\n  content: \"\\f7d6\"; }\n\n.fa-jenkins:before {\n  content: \"\\f3b6\"; }\n\n.fa-twitter:before {\n  content: \"\\f099\"; }\n\n.fa-rockrms:before {\n  content: \"\\f3e9\"; }\n\n.fa-pinterest:before {\n  content: \"\\f0d2\"; }\n\n.fa-buffer:before {\n  content: \"\\f837\"; }\n\n.fa-npm:before {\n  content: \"\\f3d4\"; }\n\n.fa-yammer:before {\n  content: \"\\f840\"; }\n\n.fa-btc:before {\n  content: \"\\f15a\"; }\n\n.fa-dribbble:before {\n  content: \"\\f17d\"; }\n\n.fa-stumbleupon-circle:before {\n  content: \"\\f1a3\"; }\n\n.fa-internet-explorer:before {\n  content: \"\\f26b\"; }\n\n.fa-stubber:before {\n  content: \"\\e5c7\"; }\n\n.fa-telegram:before {\n  content: \"\\f2c6\"; }\n\n.fa-telegram-plane:before {\n  content: \"\\f2c6\"; }\n\n.fa-old-republic:before {\n  content: \"\\f510\"; }\n\n.fa-odysee:before {\n  content: \"\\e5c6\"; }\n\n.fa-square-whatsapp:before {\n  content: \"\\f40c\"; }\n\n.fa-whatsapp-square:before {\n  content: \"\\f40c\"; }\n\n.fa-node-js:before {\n  content: \"\\f3d3\"; }\n\n.fa-edge-legacy:before {\n  content: \"\\e078\"; }\n\n.fa-slack:before {\n  content: \"\\f198\"; }\n\n.fa-slack-hash:before {\n  content: \"\\f198\"; }\n\n.fa-medrt:before {\n  content: \"\\f3c8\"; }\n\n.fa-usb:before {\n  content: \"\\f287\"; }\n\n.fa-tumblr:before {\n  content: \"\\f173\"; }\n\n.fa-vaadin:before {\n  content: \"\\f408\"; }\n\n.fa-quora:before {\n  content: \"\\f2c4\"; }\n\n.fa-square-x-twitter:before {\n  content: \"\\e61a\"; }\n\n.fa-reacteurope:before {\n  content: \"\\f75d\"; }\n\n.fa-medium:before {\n  content: \"\\f23a\"; }\n\n.fa-medium-m:before {\n  content: \"\\f23a\"; }\n\n.fa-amilia:before {\n  content: \"\\f36d\"; }\n\n.fa-mixcloud:before {\n  content: \"\\f289\"; }\n\n.fa-flipboard:before {\n  content: \"\\f44d\"; }\n\n.fa-viacoin:before {\n  content: \"\\f237\"; }\n\n.fa-critical-role:before {\n  content: \"\\f6c9\"; }\n\n.fa-sitrox:before {\n  content: \"\\e44a\"; }\n\n.fa-discourse:before {\n  content: \"\\f393\"; }\n\n.fa-joomla:before {\n  content: \"\\f1aa\"; }\n\n.fa-mastodon:before {\n  content: \"\\f4f6\"; }\n\n.fa-airbnb:before {\n  content: \"\\f834\"; }\n\n.fa-wolf-pack-battalion:before {\n  content: \"\\f514\"; }\n\n.fa-buy-n-large:before {\n  content: \"\\f8a6\"; }\n\n.fa-gulp:before {\n  content: \"\\f3ae\"; }\n\n.fa-creative-commons-sampling-plus:before {\n  content: \"\\f4f1\"; }\n\n.fa-strava:before {\n  content: \"\\f428\"; }\n\n.fa-ember:before {\n  content: \"\\f423\"; }\n\n.fa-canadian-maple-leaf:before {\n  content: \"\\f785\"; }\n\n.fa-teamspeak:before {\n  content: \"\\f4f9\"; }\n\n.fa-pushed:before {\n  content: \"\\f3e1\"; }\n\n.fa-wordpress-simple:before {\n  content: \"\\f411\"; }\n\n.fa-nutritionix:before {\n  content: \"\\f3d6\"; }\n\n.fa-wodu:before {\n  content: \"\\e088\"; }\n\n.fa-google-pay:before {\n  content: \"\\e079\"; }\n\n.fa-intercom:before {\n  content: \"\\f7af\"; }\n\n.fa-zhihu:before {\n  content: \"\\f63f\"; }\n\n.fa-korvue:before {\n  content: \"\\f42f\"; }\n\n.fa-pix:before {\n  content: \"\\e43a\"; }\n\n.fa-steam-symbol:before {\n  content: \"\\f3f6\"; }\n:root, :host {\n  --fa-style-family-classic: 'Font Awesome 6 Free';\n  --fa-font-regular: normal 400 1em/1 'Font Awesome 6 Free'; }\n\n@font-face {\n  font-family: 'Font Awesome 6 Free';\n  font-style: normal;\n  font-weight: 400;\n  font-display: block;\n  src: url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ") format(\"woff2\"), url(" + ___CSS_LOADER_URL_REPLACEMENT_3___ + ") format(\"truetype\"); }\n\n.far,\n.fa-regular {\n  font-weight: 400; }\n:root, :host {\n  --fa-style-family-classic: 'Font Awesome 6 Free';\n  --fa-font-solid: normal 900 1em/1 'Font Awesome 6 Free'; }\n\n@font-face {\n  font-family: 'Font Awesome 6 Free';\n  font-style: normal;\n  font-weight: 900;\n  font-display: block;\n  src: url(" + ___CSS_LOADER_URL_REPLACEMENT_4___ + ") format(\"woff2\"), url(" + ___CSS_LOADER_URL_REPLACEMENT_5___ + ") format(\"truetype\"); }\n\n.fas,\n.fa-solid {\n  font-weight: 900; }\n@font-face {\n  font-family: 'Font Awesome 5 Brands';\n  font-display: block;\n  font-weight: 400;\n  src: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ") format(\"woff2\"), url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ") format(\"truetype\"); }\n\n@font-face {\n  font-family: 'Font Awesome 5 Free';\n  font-display: block;\n  font-weight: 900;\n  src: url(" + ___CSS_LOADER_URL_REPLACEMENT_4___ + ") format(\"woff2\"), url(" + ___CSS_LOADER_URL_REPLACEMENT_5___ + ") format(\"truetype\"); }\n\n@font-face {\n  font-family: 'Font Awesome 5 Free';\n  font-display: block;\n  font-weight: 400;\n  src: url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ") format(\"woff2\"), url(" + ___CSS_LOADER_URL_REPLACEMENT_3___ + ") format(\"truetype\"); }\n@font-face {\n  font-family: 'FontAwesome';\n  font-display: block;\n  src: url(" + ___CSS_LOADER_URL_REPLACEMENT_4___ + ") format(\"woff2\"), url(" + ___CSS_LOADER_URL_REPLACEMENT_5___ + ") format(\"truetype\"); }\n\n@font-face {\n  font-family: 'FontAwesome';\n  font-display: block;\n  src: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ") format(\"woff2\"), url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ") format(\"truetype\"); }\n\n@font-face {\n  font-family: 'FontAwesome';\n  font-display: block;\n  src: url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ") format(\"woff2\"), url(" + ___CSS_LOADER_URL_REPLACEMENT_3___ + ") format(\"truetype\");\n  unicode-range: U+F003,U+F006,U+F014,U+F016-F017,U+F01A-F01B,U+F01D,U+F022,U+F03E,U+F044,U+F046,U+F05C-F05D,U+F06E,U+F070,U+F087-F088,U+F08A,U+F094,U+F096-F097,U+F09D,U+F0A0,U+F0A2,U+F0A4-F0A7,U+F0C5,U+F0C7,U+F0E5-F0E6,U+F0EB,U+F0F6-F0F8,U+F10C,U+F114-F115,U+F118-F11A,U+F11C-F11D,U+F133,U+F147,U+F14E,U+F150-F152,U+F185-F186,U+F18E,U+F190-F192,U+F196,U+F1C1-F1C9,U+F1D9,U+F1DB,U+F1E3,U+F1EA,U+F1F7,U+F1F9,U+F20A,U+F247-F248,U+F24A,U+F24D,U+F255-F25B,U+F25D,U+F271-F274,U+F278,U+F27B,U+F28C,U+F28E,U+F29C,U+F2B5,U+F2B7,U+F2BA,U+F2BC,U+F2BE,U+F2C0-F2C1,U+F2C3,U+F2D0,U+F2D2,U+F2D4,U+F2DC; }\n\n@font-face {\n  font-family: 'FontAwesome';\n  font-display: block;\n  src: url(" + ___CSS_LOADER_URL_REPLACEMENT_6___ + ") format(\"woff2\"), url(" + ___CSS_LOADER_URL_REPLACEMENT_7___ + ") format(\"truetype\");\n  unicode-range: U+F041,U+F047,U+F065-F066,U+F07D-F07E,U+F080,U+F08B,U+F08E,U+F090,U+F09A,U+F0AC,U+F0AE,U+F0B2,U+F0D0,U+F0D6,U+F0E4,U+F0EC,U+F10A-F10B,U+F123,U+F13E,U+F148-F149,U+F14C,U+F156,U+F15E,U+F160-F161,U+F163,U+F175-F178,U+F195,U+F1F8,U+F219,U+F27A; }\n", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join("");
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === "string") {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, ""]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/getUrl.js":
/*!********************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/getUrl.js ***!
  \********************************************************/
/***/ ((module) => {



module.exports = function (url, options) {
  if (!options) {
    // eslint-disable-next-line no-param-reassign
    options = {};
  } // eslint-disable-next-line no-underscore-dangle, no-param-reassign


  url = url && url.__esModule ? url.default : url;

  if (typeof url !== "string") {
    return url;
  } // If url is already wrapped in quotes, remove them


  if (/^['"].*['"]$/.test(url)) {
    // eslint-disable-next-line no-param-reassign
    url = url.slice(1, -1);
  }

  if (options.hash) {
    // eslint-disable-next-line no-param-reassign
    url += options.hash;
  } // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls


  if (/["'() \t\n]/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }

  return url;
};

/***/ }),

/***/ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.ttf":
/*!*******************************************************************************!*\
  !*** ./node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.ttf ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("/fonts/vendor/@fortawesome/fontawesome-free/webfa-brands-400.ttf?016b4a6cdced82ab3aa1907e3855cfd2");

/***/ }),

/***/ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.woff2":
/*!*********************************************************************************!*\
  !*** ./node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.woff2 ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("/fonts/vendor/@fortawesome/fontawesome-free/webfa-brands-400.woff2?878f31251d960bd6266f20ccdc4d738f");

/***/ }),

/***/ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-regular-400.ttf":
/*!********************************************************************************!*\
  !*** ./node_modules/@fortawesome/fontawesome-free/webfonts/fa-regular-400.ttf ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("/fonts/vendor/@fortawesome/fontawesome-free/webfa-regular-400.ttf?50701fbb8177c2dde530fc83add388ef");

/***/ }),

/***/ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-regular-400.woff2":
/*!**********************************************************************************!*\
  !*** ./node_modules/@fortawesome/fontawesome-free/webfonts/fa-regular-400.woff2 ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("/fonts/vendor/@fortawesome/fontawesome-free/webfa-regular-400.woff2?b041b1fa4fe241b234458a565482c4c6");

/***/ }),

/***/ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.ttf":
/*!******************************************************************************!*\
  !*** ./node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.ttf ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("/fonts/vendor/@fortawesome/fontawesome-free/webfa-solid-900.ttf?d75e3fd1eb12e9bd66550e304bdd1ec7");

/***/ }),

/***/ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2":
/*!********************************************************************************!*\
  !*** ./node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2 ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("/fonts/vendor/@fortawesome/fontawesome-free/webfa-solid-900.woff2?b6879d41b0852f01ed5b0216c4c72e11");

/***/ }),

/***/ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-v4compatibility.ttf":
/*!************************************************************************************!*\
  !*** ./node_modules/@fortawesome/fontawesome-free/webfonts/fa-v4compatibility.ttf ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("/fonts/vendor/@fortawesome/fontawesome-free/webfa-v4compatibility.ttf?c6a0c95b0a95c4553700768802e10f98");

/***/ }),

/***/ "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-v4compatibility.woff2":
/*!**************************************************************************************!*\
  !*** ./node_modules/@fortawesome/fontawesome-free/webfonts/fa-v4compatibility.woff2 ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("/fonts/vendor/@fortawesome/fontawesome-free/webfa-v4compatibility.woff2?1bac2991f3dbfa237aecb4bcc41ad26f");

/***/ }),

/***/ "./resources/css/app.css":
/*!*******************************!*\
  !*** ./resources/css/app.css ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/@fortawesome/fontawesome-free/css/all.css":
/*!****************************************************************!*\
  !*** ./node_modules/@fortawesome/fontawesome-free/css/all.css ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_cjs_js_ruleSet_1_rules_6_oneOf_1_use_1_postcss_loader_dist_cjs_js_ruleSet_1_rules_6_oneOf_1_use_2_all_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../css-loader/dist/cjs.js??ruleSet[1].rules[6].oneOf[1].use[1]!../../../postcss-loader/dist/cjs.js??ruleSet[1].rules[6].oneOf[1].use[2]!./all.css */ "./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[6].oneOf[1].use[1]!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[6].oneOf[1].use[2]!./node_modules/@fortawesome/fontawesome-free/css/all.css");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_css_loader_dist_cjs_js_ruleSet_1_rules_6_oneOf_1_use_1_postcss_loader_dist_cjs_js_ruleSet_1_rules_6_oneOf_1_use_2_all_css__WEBPACK_IMPORTED_MODULE_1__["default"], options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_css_loader_dist_cjs_js_ruleSet_1_rules_6_oneOf_1_use_1_postcss_loader_dist_cjs_js_ruleSet_1_rules_6_oneOf_1_use_2_all_css__WEBPACK_IMPORTED_MODULE_1__["default"].locals || {});

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/@kurkle/color/dist/color.esm.js":
/*!******************************************************!*\
  !*** ./node_modules/@kurkle/color/dist/color.esm.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Color: () => (/* binding */ Color),
/* harmony export */   b2n: () => (/* binding */ b2n),
/* harmony export */   b2p: () => (/* binding */ b2p),
/* harmony export */   "default": () => (/* binding */ index_esm),
/* harmony export */   hexParse: () => (/* binding */ hexParse),
/* harmony export */   hexString: () => (/* binding */ hexString),
/* harmony export */   hsl2rgb: () => (/* binding */ hsl2rgb),
/* harmony export */   hslString: () => (/* binding */ hslString),
/* harmony export */   hsv2rgb: () => (/* binding */ hsv2rgb),
/* harmony export */   hueParse: () => (/* binding */ hueParse),
/* harmony export */   hwb2rgb: () => (/* binding */ hwb2rgb),
/* harmony export */   lim: () => (/* binding */ lim),
/* harmony export */   n2b: () => (/* binding */ n2b),
/* harmony export */   n2p: () => (/* binding */ n2p),
/* harmony export */   nameParse: () => (/* binding */ nameParse),
/* harmony export */   p2b: () => (/* binding */ p2b),
/* harmony export */   rgb2hsl: () => (/* binding */ rgb2hsl),
/* harmony export */   rgbParse: () => (/* binding */ rgbParse),
/* harmony export */   rgbString: () => (/* binding */ rgbString),
/* harmony export */   rotate: () => (/* binding */ rotate),
/* harmony export */   round: () => (/* binding */ round)
/* harmony export */ });
/*!
 * @kurkle/color v0.3.2
 * https://github.com/kurkle/color#readme
 * (c) 2023 Jukka Kurkela
 * Released under the MIT License
 */
function round(v) {
  return v + 0.5 | 0;
}
const lim = (v, l, h) => Math.max(Math.min(v, h), l);
function p2b(v) {
  return lim(round(v * 2.55), 0, 255);
}
function b2p(v) {
  return lim(round(v / 2.55), 0, 100);
}
function n2b(v) {
  return lim(round(v * 255), 0, 255);
}
function b2n(v) {
  return lim(round(v / 2.55) / 100, 0, 1);
}
function n2p(v) {
  return lim(round(v * 100), 0, 100);
}

const map$1 = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15};
const hex = [...'0123456789ABCDEF'];
const h1 = b => hex[b & 0xF];
const h2 = b => hex[(b & 0xF0) >> 4] + hex[b & 0xF];
const eq = b => ((b & 0xF0) >> 4) === (b & 0xF);
const isShort = v => eq(v.r) && eq(v.g) && eq(v.b) && eq(v.a);
function hexParse(str) {
  var len = str.length;
  var ret;
  if (str[0] === '#') {
    if (len === 4 || len === 5) {
      ret = {
        r: 255 & map$1[str[1]] * 17,
        g: 255 & map$1[str[2]] * 17,
        b: 255 & map$1[str[3]] * 17,
        a: len === 5 ? map$1[str[4]] * 17 : 255
      };
    } else if (len === 7 || len === 9) {
      ret = {
        r: map$1[str[1]] << 4 | map$1[str[2]],
        g: map$1[str[3]] << 4 | map$1[str[4]],
        b: map$1[str[5]] << 4 | map$1[str[6]],
        a: len === 9 ? (map$1[str[7]] << 4 | map$1[str[8]]) : 255
      };
    }
  }
  return ret;
}
const alpha = (a, f) => a < 255 ? f(a) : '';
function hexString(v) {
  var f = isShort(v) ? h1 : h2;
  return v
    ? '#' + f(v.r) + f(v.g) + f(v.b) + alpha(v.a, f)
    : undefined;
}

const HUE_RE = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function hsl2rgbn(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [f(0), f(8), f(4)];
}
function hsv2rgbn(h, s, v) {
  const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return [f(5), f(3), f(1)];
}
function hwb2rgbn(h, w, b) {
  const rgb = hsl2rgbn(h, 1, 0.5);
  let i;
  if (w + b > 1) {
    i = 1 / (w + b);
    w *= i;
    b *= i;
  }
  for (i = 0; i < 3; i++) {
    rgb[i] *= 1 - w - b;
    rgb[i] += w;
  }
  return rgb;
}
function hueValue(r, g, b, d, max) {
  if (r === max) {
    return ((g - b) / d) + (g < b ? 6 : 0);
  }
  if (g === max) {
    return (b - r) / d + 2;
  }
  return (r - g) / d + 4;
}
function rgb2hsl(v) {
  const range = 255;
  const r = v.r / range;
  const g = v.g / range;
  const b = v.b / range;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h, s, d;
  if (max !== min) {
    d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = hueValue(r, g, b, d, max);
    h = h * 60 + 0.5;
  }
  return [h | 0, s || 0, l];
}
function calln(f, a, b, c) {
  return (
    Array.isArray(a)
      ? f(a[0], a[1], a[2])
      : f(a, b, c)
  ).map(n2b);
}
function hsl2rgb(h, s, l) {
  return calln(hsl2rgbn, h, s, l);
}
function hwb2rgb(h, w, b) {
  return calln(hwb2rgbn, h, w, b);
}
function hsv2rgb(h, s, v) {
  return calln(hsv2rgbn, h, s, v);
}
function hue(h) {
  return (h % 360 + 360) % 360;
}
function hueParse(str) {
  const m = HUE_RE.exec(str);
  let a = 255;
  let v;
  if (!m) {
    return;
  }
  if (m[5] !== v) {
    a = m[6] ? p2b(+m[5]) : n2b(+m[5]);
  }
  const h = hue(+m[2]);
  const p1 = +m[3] / 100;
  const p2 = +m[4] / 100;
  if (m[1] === 'hwb') {
    v = hwb2rgb(h, p1, p2);
  } else if (m[1] === 'hsv') {
    v = hsv2rgb(h, p1, p2);
  } else {
    v = hsl2rgb(h, p1, p2);
  }
  return {
    r: v[0],
    g: v[1],
    b: v[2],
    a: a
  };
}
function rotate(v, deg) {
  var h = rgb2hsl(v);
  h[0] = hue(h[0] + deg);
  h = hsl2rgb(h);
  v.r = h[0];
  v.g = h[1];
  v.b = h[2];
}
function hslString(v) {
  if (!v) {
    return;
  }
  const a = rgb2hsl(v);
  const h = a[0];
  const s = n2p(a[1]);
  const l = n2p(a[2]);
  return v.a < 255
    ? `hsla(${h}, ${s}%, ${l}%, ${b2n(v.a)})`
    : `hsl(${h}, ${s}%, ${l}%)`;
}

const map = {
  x: 'dark',
  Z: 'light',
  Y: 're',
  X: 'blu',
  W: 'gr',
  V: 'medium',
  U: 'slate',
  A: 'ee',
  T: 'ol',
  S: 'or',
  B: 'ra',
  C: 'lateg',
  D: 'ights',
  R: 'in',
  Q: 'turquois',
  E: 'hi',
  P: 'ro',
  O: 'al',
  N: 'le',
  M: 'de',
  L: 'yello',
  F: 'en',
  K: 'ch',
  G: 'arks',
  H: 'ea',
  I: 'ightg',
  J: 'wh'
};
const names$1 = {
  OiceXe: 'f0f8ff',
  antiquewEte: 'faebd7',
  aqua: 'ffff',
  aquamarRe: '7fffd4',
  azuY: 'f0ffff',
  beige: 'f5f5dc',
  bisque: 'ffe4c4',
  black: '0',
  blanKedOmond: 'ffebcd',
  Xe: 'ff',
  XeviTet: '8a2be2',
  bPwn: 'a52a2a',
  burlywood: 'deb887',
  caMtXe: '5f9ea0',
  KartYuse: '7fff00',
  KocTate: 'd2691e',
  cSO: 'ff7f50',
  cSnflowerXe: '6495ed',
  cSnsilk: 'fff8dc',
  crimson: 'dc143c',
  cyan: 'ffff',
  xXe: '8b',
  xcyan: '8b8b',
  xgTMnPd: 'b8860b',
  xWay: 'a9a9a9',
  xgYF: '6400',
  xgYy: 'a9a9a9',
  xkhaki: 'bdb76b',
  xmagFta: '8b008b',
  xTivegYF: '556b2f',
  xSange: 'ff8c00',
  xScEd: '9932cc',
  xYd: '8b0000',
  xsOmon: 'e9967a',
  xsHgYF: '8fbc8f',
  xUXe: '483d8b',
  xUWay: '2f4f4f',
  xUgYy: '2f4f4f',
  xQe: 'ced1',
  xviTet: '9400d3',
  dAppRk: 'ff1493',
  dApskyXe: 'bfff',
  dimWay: '696969',
  dimgYy: '696969',
  dodgerXe: '1e90ff',
  fiYbrick: 'b22222',
  flSOwEte: 'fffaf0',
  foYstWAn: '228b22',
  fuKsia: 'ff00ff',
  gaRsbSo: 'dcdcdc',
  ghostwEte: 'f8f8ff',
  gTd: 'ffd700',
  gTMnPd: 'daa520',
  Way: '808080',
  gYF: '8000',
  gYFLw: 'adff2f',
  gYy: '808080',
  honeyMw: 'f0fff0',
  hotpRk: 'ff69b4',
  RdianYd: 'cd5c5c',
  Rdigo: '4b0082',
  ivSy: 'fffff0',
  khaki: 'f0e68c',
  lavFMr: 'e6e6fa',
  lavFMrXsh: 'fff0f5',
  lawngYF: '7cfc00',
  NmoncEffon: 'fffacd',
  ZXe: 'add8e6',
  ZcSO: 'f08080',
  Zcyan: 'e0ffff',
  ZgTMnPdLw: 'fafad2',
  ZWay: 'd3d3d3',
  ZgYF: '90ee90',
  ZgYy: 'd3d3d3',
  ZpRk: 'ffb6c1',
  ZsOmon: 'ffa07a',
  ZsHgYF: '20b2aa',
  ZskyXe: '87cefa',
  ZUWay: '778899',
  ZUgYy: '778899',
  ZstAlXe: 'b0c4de',
  ZLw: 'ffffe0',
  lime: 'ff00',
  limegYF: '32cd32',
  lRF: 'faf0e6',
  magFta: 'ff00ff',
  maPon: '800000',
  VaquamarRe: '66cdaa',
  VXe: 'cd',
  VScEd: 'ba55d3',
  VpurpN: '9370db',
  VsHgYF: '3cb371',
  VUXe: '7b68ee',
  VsprRggYF: 'fa9a',
  VQe: '48d1cc',
  VviTetYd: 'c71585',
  midnightXe: '191970',
  mRtcYam: 'f5fffa',
  mistyPse: 'ffe4e1',
  moccasR: 'ffe4b5',
  navajowEte: 'ffdead',
  navy: '80',
  Tdlace: 'fdf5e6',
  Tive: '808000',
  TivedBb: '6b8e23',
  Sange: 'ffa500',
  SangeYd: 'ff4500',
  ScEd: 'da70d6',
  pOegTMnPd: 'eee8aa',
  pOegYF: '98fb98',
  pOeQe: 'afeeee',
  pOeviTetYd: 'db7093',
  papayawEp: 'ffefd5',
  pHKpuff: 'ffdab9',
  peru: 'cd853f',
  pRk: 'ffc0cb',
  plum: 'dda0dd',
  powMrXe: 'b0e0e6',
  purpN: '800080',
  YbeccapurpN: '663399',
  Yd: 'ff0000',
  Psybrown: 'bc8f8f',
  PyOXe: '4169e1',
  saddNbPwn: '8b4513',
  sOmon: 'fa8072',
  sandybPwn: 'f4a460',
  sHgYF: '2e8b57',
  sHshell: 'fff5ee',
  siFna: 'a0522d',
  silver: 'c0c0c0',
  skyXe: '87ceeb',
  UXe: '6a5acd',
  UWay: '708090',
  UgYy: '708090',
  snow: 'fffafa',
  sprRggYF: 'ff7f',
  stAlXe: '4682b4',
  tan: 'd2b48c',
  teO: '8080',
  tEstN: 'd8bfd8',
  tomato: 'ff6347',
  Qe: '40e0d0',
  viTet: 'ee82ee',
  JHt: 'f5deb3',
  wEte: 'ffffff',
  wEtesmoke: 'f5f5f5',
  Lw: 'ffff00',
  LwgYF: '9acd32'
};
function unpack() {
  const unpacked = {};
  const keys = Object.keys(names$1);
  const tkeys = Object.keys(map);
  let i, j, k, ok, nk;
  for (i = 0; i < keys.length; i++) {
    ok = nk = keys[i];
    for (j = 0; j < tkeys.length; j++) {
      k = tkeys[j];
      nk = nk.replace(k, map[k]);
    }
    k = parseInt(names$1[ok], 16);
    unpacked[nk] = [k >> 16 & 0xFF, k >> 8 & 0xFF, k & 0xFF];
  }
  return unpacked;
}

let names;
function nameParse(str) {
  if (!names) {
    names = unpack();
    names.transparent = [0, 0, 0, 0];
  }
  const a = names[str.toLowerCase()];
  return a && {
    r: a[0],
    g: a[1],
    b: a[2],
    a: a.length === 4 ? a[3] : 255
  };
}

const RGB_RE = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function rgbParse(str) {
  const m = RGB_RE.exec(str);
  let a = 255;
  let r, g, b;
  if (!m) {
    return;
  }
  if (m[7] !== r) {
    const v = +m[7];
    a = m[8] ? p2b(v) : lim(v * 255, 0, 255);
  }
  r = +m[1];
  g = +m[3];
  b = +m[5];
  r = 255 & (m[2] ? p2b(r) : lim(r, 0, 255));
  g = 255 & (m[4] ? p2b(g) : lim(g, 0, 255));
  b = 255 & (m[6] ? p2b(b) : lim(b, 0, 255));
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}
function rgbString(v) {
  return v && (
    v.a < 255
      ? `rgba(${v.r}, ${v.g}, ${v.b}, ${b2n(v.a)})`
      : `rgb(${v.r}, ${v.g}, ${v.b})`
  );
}

const to = v => v <= 0.0031308 ? v * 12.92 : Math.pow(v, 1.0 / 2.4) * 1.055 - 0.055;
const from = v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
function interpolate(rgb1, rgb2, t) {
  const r = from(b2n(rgb1.r));
  const g = from(b2n(rgb1.g));
  const b = from(b2n(rgb1.b));
  return {
    r: n2b(to(r + t * (from(b2n(rgb2.r)) - r))),
    g: n2b(to(g + t * (from(b2n(rgb2.g)) - g))),
    b: n2b(to(b + t * (from(b2n(rgb2.b)) - b))),
    a: rgb1.a + t * (rgb2.a - rgb1.a)
  };
}

function modHSL(v, i, ratio) {
  if (v) {
    let tmp = rgb2hsl(v);
    tmp[i] = Math.max(0, Math.min(tmp[i] + tmp[i] * ratio, i === 0 ? 360 : 1));
    tmp = hsl2rgb(tmp);
    v.r = tmp[0];
    v.g = tmp[1];
    v.b = tmp[2];
  }
}
function clone(v, proto) {
  return v ? Object.assign(proto || {}, v) : v;
}
function fromObject(input) {
  var v = {r: 0, g: 0, b: 0, a: 255};
  if (Array.isArray(input)) {
    if (input.length >= 3) {
      v = {r: input[0], g: input[1], b: input[2], a: 255};
      if (input.length > 3) {
        v.a = n2b(input[3]);
      }
    }
  } else {
    v = clone(input, {r: 0, g: 0, b: 0, a: 1});
    v.a = n2b(v.a);
  }
  return v;
}
function functionParse(str) {
  if (str.charAt(0) === 'r') {
    return rgbParse(str);
  }
  return hueParse(str);
}
class Color {
  constructor(input) {
    if (input instanceof Color) {
      return input;
    }
    const type = typeof input;
    let v;
    if (type === 'object') {
      v = fromObject(input);
    } else if (type === 'string') {
      v = hexParse(input) || nameParse(input) || functionParse(input);
    }
    this._rgb = v;
    this._valid = !!v;
  }
  get valid() {
    return this._valid;
  }
  get rgb() {
    var v = clone(this._rgb);
    if (v) {
      v.a = b2n(v.a);
    }
    return v;
  }
  set rgb(obj) {
    this._rgb = fromObject(obj);
  }
  rgbString() {
    return this._valid ? rgbString(this._rgb) : undefined;
  }
  hexString() {
    return this._valid ? hexString(this._rgb) : undefined;
  }
  hslString() {
    return this._valid ? hslString(this._rgb) : undefined;
  }
  mix(color, weight) {
    if (color) {
      const c1 = this.rgb;
      const c2 = color.rgb;
      let w2;
      const p = weight === w2 ? 0.5 : weight;
      const w = 2 * p - 1;
      const a = c1.a - c2.a;
      const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
      w2 = 1 - w1;
      c1.r = 0xFF & w1 * c1.r + w2 * c2.r + 0.5;
      c1.g = 0xFF & w1 * c1.g + w2 * c2.g + 0.5;
      c1.b = 0xFF & w1 * c1.b + w2 * c2.b + 0.5;
      c1.a = p * c1.a + (1 - p) * c2.a;
      this.rgb = c1;
    }
    return this;
  }
  interpolate(color, t) {
    if (color) {
      this._rgb = interpolate(this._rgb, color._rgb, t);
    }
    return this;
  }
  clone() {
    return new Color(this.rgb);
  }
  alpha(a) {
    this._rgb.a = n2b(a);
    return this;
  }
  clearer(ratio) {
    const rgb = this._rgb;
    rgb.a *= 1 - ratio;
    return this;
  }
  greyscale() {
    const rgb = this._rgb;
    const val = round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11);
    rgb.r = rgb.g = rgb.b = val;
    return this;
  }
  opaquer(ratio) {
    const rgb = this._rgb;
    rgb.a *= 1 + ratio;
    return this;
  }
  negate() {
    const v = this._rgb;
    v.r = 255 - v.r;
    v.g = 255 - v.g;
    v.b = 255 - v.b;
    return this;
  }
  lighten(ratio) {
    modHSL(this._rgb, 2, ratio);
    return this;
  }
  darken(ratio) {
    modHSL(this._rgb, 2, -ratio);
    return this;
  }
  saturate(ratio) {
    modHSL(this._rgb, 1, ratio);
    return this;
  }
  desaturate(ratio) {
    modHSL(this._rgb, 1, -ratio);
    return this;
  }
  rotate(deg) {
    rotate(this._rgb, deg);
    return this;
  }
}

function index_esm(input) {
  return new Color(input);
}




/***/ }),

/***/ "./resources/js/app.js":
/*!*****************************!*\
  !*** ./resources/js/app.js ***!
  \*****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _fortawesome_fontawesome_free_css_all_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @fortawesome/fontawesome-free/css/all.css */ "./node_modules/@fortawesome/fontawesome-free/css/all.css");
/* harmony import */ var _mychart_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mychart.js */ "./resources/js/mychart.js");
/* harmony import */ var alpinejs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! alpinejs */ "./node_modules/alpinejs/dist/module.esm.js");
require('./bootstrap.js');



window.Alpine = alpinejs__WEBPACK_IMPORTED_MODULE_2__["default"];
alpinejs__WEBPACK_IMPORTED_MODULE_2__["default"].start();

/***/ }),

/***/ "./resources/js/mychart.js":
/*!*********************************!*\
  !*** ./resources/js/mychart.js ***!
  \*********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var chart_js_auto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! chart.js/auto */ "./node_modules/chart.js/auto/auto.js");

var labels = ['January', 'February', 'March', 'April', 'May', 'June'];
var data = {
  labels: labels,
  datasets: [{
    label: 'My First dataset',
    backgroundColor: 'rgb(255, 99, 132)',
    borderColor: 'rgb(255, 99, 132)',
    data: [0, 10, 5, 2, 20, 30, 45]
  }]
};
var config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    }
  }
};
new chart_js_auto__WEBPACK_IMPORTED_MODULE_0__["default"](document.getElementById('myChart'), config);

/***/ }),

/***/ "./node_modules/chart.js/auto/auto.js":
/*!********************************************!*\
  !*** ./node_modules/chart.js/auto/auto.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Animation),
/* harmony export */   Animations: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Animations),
/* harmony export */   ArcElement: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.ArcElement),
/* harmony export */   BarController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.BarController),
/* harmony export */   BarElement: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.BarElement),
/* harmony export */   BasePlatform: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.BasePlatform),
/* harmony export */   BasicPlatform: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.BasicPlatform),
/* harmony export */   BubbleController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.BubbleController),
/* harmony export */   CategoryScale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.CategoryScale),
/* harmony export */   Chart: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Chart),
/* harmony export */   Colors: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Colors),
/* harmony export */   DatasetController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.DatasetController),
/* harmony export */   Decimation: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Decimation),
/* harmony export */   DomPlatform: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.DomPlatform),
/* harmony export */   DoughnutController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.DoughnutController),
/* harmony export */   Element: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Element),
/* harmony export */   Filler: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Filler),
/* harmony export */   Interaction: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Interaction),
/* harmony export */   Legend: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Legend),
/* harmony export */   LineController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.LineController),
/* harmony export */   LineElement: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.LineElement),
/* harmony export */   LinearScale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.LinearScale),
/* harmony export */   LogarithmicScale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.LogarithmicScale),
/* harmony export */   PieController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.PieController),
/* harmony export */   PointElement: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.PointElement),
/* harmony export */   PolarAreaController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.PolarAreaController),
/* harmony export */   RadarController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.RadarController),
/* harmony export */   RadialLinearScale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.RadialLinearScale),
/* harmony export */   Scale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Scale),
/* harmony export */   ScatterController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.ScatterController),
/* harmony export */   SubTitle: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.SubTitle),
/* harmony export */   Ticks: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Ticks),
/* harmony export */   TimeScale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.TimeScale),
/* harmony export */   TimeSeriesScale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.TimeSeriesScale),
/* harmony export */   Title: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Title),
/* harmony export */   Tooltip: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Tooltip),
/* harmony export */   _adapters: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__._adapters),
/* harmony export */   _detectPlatform: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__._detectPlatform),
/* harmony export */   animator: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.animator),
/* harmony export */   controllers: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.controllers),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   defaults: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.defaults),
/* harmony export */   elements: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.elements),
/* harmony export */   layouts: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.layouts),
/* harmony export */   plugins: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.plugins),
/* harmony export */   registerables: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.registerables),
/* harmony export */   registry: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.registry),
/* harmony export */   scales: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.scales)
/* harmony export */ });
/* harmony import */ var _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dist/chart.js */ "./node_modules/chart.js/dist/chart.js");


_dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Chart.register(..._dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.registerables);


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Chart);


/***/ }),

/***/ "./node_modules/chart.js/dist/chart.js":
/*!*********************************************!*\
  !*** ./node_modules/chart.js/dist/chart.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* binding */ Animation),
/* harmony export */   Animations: () => (/* binding */ Animations),
/* harmony export */   ArcElement: () => (/* binding */ ArcElement),
/* harmony export */   BarController: () => (/* binding */ BarController),
/* harmony export */   BarElement: () => (/* binding */ BarElement),
/* harmony export */   BasePlatform: () => (/* binding */ BasePlatform),
/* harmony export */   BasicPlatform: () => (/* binding */ BasicPlatform),
/* harmony export */   BubbleController: () => (/* binding */ BubbleController),
/* harmony export */   CategoryScale: () => (/* binding */ CategoryScale),
/* harmony export */   Chart: () => (/* binding */ Chart),
/* harmony export */   Colors: () => (/* binding */ plugin_colors),
/* harmony export */   DatasetController: () => (/* binding */ DatasetController),
/* harmony export */   Decimation: () => (/* binding */ plugin_decimation),
/* harmony export */   DomPlatform: () => (/* binding */ DomPlatform),
/* harmony export */   DoughnutController: () => (/* binding */ DoughnutController),
/* harmony export */   Element: () => (/* binding */ Element),
/* harmony export */   Filler: () => (/* binding */ index),
/* harmony export */   Interaction: () => (/* binding */ Interaction),
/* harmony export */   Legend: () => (/* binding */ plugin_legend),
/* harmony export */   LineController: () => (/* binding */ LineController),
/* harmony export */   LineElement: () => (/* binding */ LineElement),
/* harmony export */   LinearScale: () => (/* binding */ LinearScale),
/* harmony export */   LogarithmicScale: () => (/* binding */ LogarithmicScale),
/* harmony export */   PieController: () => (/* binding */ PieController),
/* harmony export */   PointElement: () => (/* binding */ PointElement),
/* harmony export */   PolarAreaController: () => (/* binding */ PolarAreaController),
/* harmony export */   RadarController: () => (/* binding */ RadarController),
/* harmony export */   RadialLinearScale: () => (/* binding */ RadialLinearScale),
/* harmony export */   Scale: () => (/* binding */ Scale),
/* harmony export */   ScatterController: () => (/* binding */ ScatterController),
/* harmony export */   SubTitle: () => (/* binding */ plugin_subtitle),
/* harmony export */   Ticks: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aL),
/* harmony export */   TimeScale: () => (/* binding */ TimeScale),
/* harmony export */   TimeSeriesScale: () => (/* binding */ TimeSeriesScale),
/* harmony export */   Title: () => (/* binding */ plugin_title),
/* harmony export */   Tooltip: () => (/* binding */ plugin_tooltip),
/* harmony export */   _adapters: () => (/* binding */ adapters),
/* harmony export */   _detectPlatform: () => (/* binding */ _detectPlatform),
/* harmony export */   animator: () => (/* binding */ animator),
/* harmony export */   controllers: () => (/* binding */ controllers),
/* harmony export */   defaults: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d),
/* harmony export */   elements: () => (/* binding */ elements),
/* harmony export */   layouts: () => (/* binding */ layouts),
/* harmony export */   plugins: () => (/* binding */ plugins),
/* harmony export */   registerables: () => (/* binding */ registerables),
/* harmony export */   registry: () => (/* binding */ registry),
/* harmony export */   scales: () => (/* binding */ scales)
/* harmony export */ });
/* harmony import */ var _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chunks/helpers.segment.js */ "./node_modules/chart.js/dist/chunks/helpers.segment.js");
/*!
 * Chart.js v4.4.1
 * https://www.chartjs.org
 * (c) 2023 Chart.js Contributors
 * Released under the MIT License
 */



class Animator {
    constructor(){
        this._request = null;
        this._charts = new Map();
        this._running = false;
        this._lastDate = undefined;
    }
 _notify(chart, anims, date, type) {
        const callbacks = anims.listeners[type];
        const numSteps = anims.duration;
        callbacks.forEach((fn)=>fn({
                chart,
                initial: anims.initial,
                numSteps,
                currentStep: Math.min(date - anims.start, numSteps)
            }));
    }
 _refresh() {
        if (this._request) {
            return;
        }
        this._running = true;
        this._request = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.r.call(window, ()=>{
            this._update();
            this._request = null;
            if (this._running) {
                this._refresh();
            }
        });
    }
 _update(date = Date.now()) {
        let remaining = 0;
        this._charts.forEach((anims, chart)=>{
            if (!anims.running || !anims.items.length) {
                return;
            }
            const items = anims.items;
            let i = items.length - 1;
            let draw = false;
            let item;
            for(; i >= 0; --i){
                item = items[i];
                if (item._active) {
                    if (item._total > anims.duration) {
                        anims.duration = item._total;
                    }
                    item.tick(date);
                    draw = true;
                } else {
                    items[i] = items[items.length - 1];
                    items.pop();
                }
            }
            if (draw) {
                chart.draw();
                this._notify(chart, anims, date, 'progress');
            }
            if (!items.length) {
                anims.running = false;
                this._notify(chart, anims, date, 'complete');
                anims.initial = false;
            }
            remaining += items.length;
        });
        this._lastDate = date;
        if (remaining === 0) {
            this._running = false;
        }
    }
 _getAnims(chart) {
        const charts = this._charts;
        let anims = charts.get(chart);
        if (!anims) {
            anims = {
                running: false,
                initial: true,
                items: [],
                listeners: {
                    complete: [],
                    progress: []
                }
            };
            charts.set(chart, anims);
        }
        return anims;
    }
 listen(chart, event, cb) {
        this._getAnims(chart).listeners[event].push(cb);
    }
 add(chart, items) {
        if (!items || !items.length) {
            return;
        }
        this._getAnims(chart).items.push(...items);
    }
 has(chart) {
        return this._getAnims(chart).items.length > 0;
    }
 start(chart) {
        const anims = this._charts.get(chart);
        if (!anims) {
            return;
        }
        anims.running = true;
        anims.start = Date.now();
        anims.duration = anims.items.reduce((acc, cur)=>Math.max(acc, cur._duration), 0);
        this._refresh();
    }
    running(chart) {
        if (!this._running) {
            return false;
        }
        const anims = this._charts.get(chart);
        if (!anims || !anims.running || !anims.items.length) {
            return false;
        }
        return true;
    }
 stop(chart) {
        const anims = this._charts.get(chart);
        if (!anims || !anims.items.length) {
            return;
        }
        const items = anims.items;
        let i = items.length - 1;
        for(; i >= 0; --i){
            items[i].cancel();
        }
        anims.items = [];
        this._notify(chart, anims, Date.now(), 'complete');
    }
 remove(chart) {
        return this._charts.delete(chart);
    }
}
var animator = /* #__PURE__ */ new Animator();

const transparent = 'transparent';
const interpolators = {
    boolean (from, to, factor) {
        return factor > 0.5 ? to : from;
    },
 color (from, to, factor) {
        const c0 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.c)(from || transparent);
        const c1 = c0.valid && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.c)(to || transparent);
        return c1 && c1.valid ? c1.mix(c0, factor).hexString() : to;
    },
    number (from, to, factor) {
        return from + (to - from) * factor;
    }
};
class Animation {
    constructor(cfg, target, prop, to){
        const currentValue = target[prop];
        to = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a)([
            cfg.to,
            to,
            currentValue,
            cfg.from
        ]);
        const from = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a)([
            cfg.from,
            currentValue,
            to
        ]);
        this._active = true;
        this._fn = cfg.fn || interpolators[cfg.type || typeof from];
        this._easing = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.e[cfg.easing] || _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.e.linear;
        this._start = Math.floor(Date.now() + (cfg.delay || 0));
        this._duration = this._total = Math.floor(cfg.duration);
        this._loop = !!cfg.loop;
        this._target = target;
        this._prop = prop;
        this._from = from;
        this._to = to;
        this._promises = undefined;
    }
    active() {
        return this._active;
    }
    update(cfg, to, date) {
        if (this._active) {
            this._notify(false);
            const currentValue = this._target[this._prop];
            const elapsed = date - this._start;
            const remain = this._duration - elapsed;
            this._start = date;
            this._duration = Math.floor(Math.max(remain, cfg.duration));
            this._total += elapsed;
            this._loop = !!cfg.loop;
            this._to = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a)([
                cfg.to,
                to,
                currentValue,
                cfg.from
            ]);
            this._from = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a)([
                cfg.from,
                currentValue,
                to
            ]);
        }
    }
    cancel() {
        if (this._active) {
            this.tick(Date.now());
            this._active = false;
            this._notify(false);
        }
    }
    tick(date) {
        const elapsed = date - this._start;
        const duration = this._duration;
        const prop = this._prop;
        const from = this._from;
        const loop = this._loop;
        const to = this._to;
        let factor;
        this._active = from !== to && (loop || elapsed < duration);
        if (!this._active) {
            this._target[prop] = to;
            this._notify(true);
            return;
        }
        if (elapsed < 0) {
            this._target[prop] = from;
            return;
        }
        factor = elapsed / duration % 2;
        factor = loop && factor > 1 ? 2 - factor : factor;
        factor = this._easing(Math.min(1, Math.max(0, factor)));
        this._target[prop] = this._fn(from, to, factor);
    }
    wait() {
        const promises = this._promises || (this._promises = []);
        return new Promise((res, rej)=>{
            promises.push({
                res,
                rej
            });
        });
    }
    _notify(resolved) {
        const method = resolved ? 'res' : 'rej';
        const promises = this._promises || [];
        for(let i = 0; i < promises.length; i++){
            promises[i][method]();
        }
    }
}

class Animations {
    constructor(chart, config){
        this._chart = chart;
        this._properties = new Map();
        this.configure(config);
    }
    configure(config) {
        if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(config)) {
            return;
        }
        const animationOptions = Object.keys(_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.animation);
        const animatedProps = this._properties;
        Object.getOwnPropertyNames(config).forEach((key)=>{
            const cfg = config[key];
            if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(cfg)) {
                return;
            }
            const resolved = {};
            for (const option of animationOptions){
                resolved[option] = cfg[option];
            }
            ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(cfg.properties) && cfg.properties || [
                key
            ]).forEach((prop)=>{
                if (prop === key || !animatedProps.has(prop)) {
                    animatedProps.set(prop, resolved);
                }
            });
        });
    }
 _animateOptions(target, values) {
        const newOptions = values.options;
        const options = resolveTargetOptions(target, newOptions);
        if (!options) {
            return [];
        }
        const animations = this._createAnimations(options, newOptions);
        if (newOptions.$shared) {
            awaitAll(target.options.$animations, newOptions).then(()=>{
                target.options = newOptions;
            }, ()=>{
            });
        }
        return animations;
    }
 _createAnimations(target, values) {
        const animatedProps = this._properties;
        const animations = [];
        const running = target.$animations || (target.$animations = {});
        const props = Object.keys(values);
        const date = Date.now();
        let i;
        for(i = props.length - 1; i >= 0; --i){
            const prop = props[i];
            if (prop.charAt(0) === '$') {
                continue;
            }
            if (prop === 'options') {
                animations.push(...this._animateOptions(target, values));
                continue;
            }
            const value = values[prop];
            let animation = running[prop];
            const cfg = animatedProps.get(prop);
            if (animation) {
                if (cfg && animation.active()) {
                    animation.update(cfg, value, date);
                    continue;
                } else {
                    animation.cancel();
                }
            }
            if (!cfg || !cfg.duration) {
                target[prop] = value;
                continue;
            }
            running[prop] = animation = new Animation(cfg, target, prop, value);
            animations.push(animation);
        }
        return animations;
    }
 update(target, values) {
        if (this._properties.size === 0) {
            Object.assign(target, values);
            return;
        }
        const animations = this._createAnimations(target, values);
        if (animations.length) {
            animator.add(this._chart, animations);
            return true;
        }
    }
}
function awaitAll(animations, properties) {
    const running = [];
    const keys = Object.keys(properties);
    for(let i = 0; i < keys.length; i++){
        const anim = animations[keys[i]];
        if (anim && anim.active()) {
            running.push(anim.wait());
        }
    }
    return Promise.all(running);
}
function resolveTargetOptions(target, newOptions) {
    if (!newOptions) {
        return;
    }
    let options = target.options;
    if (!options) {
        target.options = newOptions;
        return;
    }
    if (options.$shared) {
        target.options = options = Object.assign({}, options, {
            $shared: false,
            $animations: {}
        });
    }
    return options;
}

function scaleClip(scale, allowedOverflow) {
    const opts = scale && scale.options || {};
    const reverse = opts.reverse;
    const min = opts.min === undefined ? allowedOverflow : 0;
    const max = opts.max === undefined ? allowedOverflow : 0;
    return {
        start: reverse ? max : min,
        end: reverse ? min : max
    };
}
function defaultClip(xScale, yScale, allowedOverflow) {
    if (allowedOverflow === false) {
        return false;
    }
    const x = scaleClip(xScale, allowedOverflow);
    const y = scaleClip(yScale, allowedOverflow);
    return {
        top: y.end,
        right: x.end,
        bottom: y.start,
        left: x.start
    };
}
function toClip(value) {
    let t, r, b, l;
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(value)) {
        t = value.top;
        r = value.right;
        b = value.bottom;
        l = value.left;
    } else {
        t = r = b = l = value;
    }
    return {
        top: t,
        right: r,
        bottom: b,
        left: l,
        disabled: value === false
    };
}
function getSortedDatasetIndices(chart, filterVisible) {
    const keys = [];
    const metasets = chart._getSortedDatasetMetas(filterVisible);
    let i, ilen;
    for(i = 0, ilen = metasets.length; i < ilen; ++i){
        keys.push(metasets[i].index);
    }
    return keys;
}
function applyStack(stack, value, dsIndex, options = {}) {
    const keys = stack.keys;
    const singleMode = options.mode === 'single';
    let i, ilen, datasetIndex, otherValue;
    if (value === null) {
        return;
    }
    for(i = 0, ilen = keys.length; i < ilen; ++i){
        datasetIndex = +keys[i];
        if (datasetIndex === dsIndex) {
            if (options.all) {
                continue;
            }
            break;
        }
        otherValue = stack.values[datasetIndex];
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(otherValue) && (singleMode || value === 0 || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(value) === (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(otherValue))) {
            value += otherValue;
        }
    }
    return value;
}
function convertObjectDataToArray(data) {
    const keys = Object.keys(data);
    const adata = new Array(keys.length);
    let i, ilen, key;
    for(i = 0, ilen = keys.length; i < ilen; ++i){
        key = keys[i];
        adata[i] = {
            x: key,
            y: data[key]
        };
    }
    return adata;
}
function isStacked(scale, meta) {
    const stacked = scale && scale.options.stacked;
    return stacked || stacked === undefined && meta.stack !== undefined;
}
function getStackKey(indexScale, valueScale, meta) {
    return `${indexScale.id}.${valueScale.id}.${meta.stack || meta.type}`;
}
function getUserBounds(scale) {
    const { min , max , minDefined , maxDefined  } = scale.getUserBounds();
    return {
        min: minDefined ? min : Number.NEGATIVE_INFINITY,
        max: maxDefined ? max : Number.POSITIVE_INFINITY
    };
}
function getOrCreateStack(stacks, stackKey, indexValue) {
    const subStack = stacks[stackKey] || (stacks[stackKey] = {});
    return subStack[indexValue] || (subStack[indexValue] = {});
}
function getLastIndexInStack(stack, vScale, positive, type) {
    for (const meta of vScale.getMatchingVisibleMetas(type).reverse()){
        const value = stack[meta.index];
        if (positive && value > 0 || !positive && value < 0) {
            return meta.index;
        }
    }
    return null;
}
function updateStacks(controller, parsed) {
    const { chart , _cachedMeta: meta  } = controller;
    const stacks = chart._stacks || (chart._stacks = {});
    const { iScale , vScale , index: datasetIndex  } = meta;
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const key = getStackKey(iScale, vScale, meta);
    const ilen = parsed.length;
    let stack;
    for(let i = 0; i < ilen; ++i){
        const item = parsed[i];
        const { [iAxis]: index , [vAxis]: value  } = item;
        const itemStacks = item._stacks || (item._stacks = {});
        stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index);
        stack[datasetIndex] = value;
        stack._top = getLastIndexInStack(stack, vScale, true, meta.type);
        stack._bottom = getLastIndexInStack(stack, vScale, false, meta.type);
        const visualValues = stack._visualValues || (stack._visualValues = {});
        visualValues[datasetIndex] = value;
    }
}
function getFirstScaleId(chart, axis) {
    const scales = chart.scales;
    return Object.keys(scales).filter((key)=>scales[key].axis === axis).shift();
}
function createDatasetContext(parent, index) {
    return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(parent, {
        active: false,
        dataset: undefined,
        datasetIndex: index,
        index,
        mode: 'default',
        type: 'dataset'
    });
}
function createDataContext(parent, index, element) {
    return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(parent, {
        active: false,
        dataIndex: index,
        parsed: undefined,
        raw: undefined,
        element,
        index,
        mode: 'default',
        type: 'data'
    });
}
function clearStacks(meta, items) {
    const datasetIndex = meta.controller.index;
    const axis = meta.vScale && meta.vScale.axis;
    if (!axis) {
        return;
    }
    items = items || meta._parsed;
    for (const parsed of items){
        const stacks = parsed._stacks;
        if (!stacks || stacks[axis] === undefined || stacks[axis][datasetIndex] === undefined) {
            return;
        }
        delete stacks[axis][datasetIndex];
        if (stacks[axis]._visualValues !== undefined && stacks[axis]._visualValues[datasetIndex] !== undefined) {
            delete stacks[axis]._visualValues[datasetIndex];
        }
    }
}
const isDirectUpdateMode = (mode)=>mode === 'reset' || mode === 'none';
const cloneIfNotShared = (cached, shared)=>shared ? cached : Object.assign({}, cached);
const createStack = (canStack, meta, chart)=>canStack && !meta.hidden && meta._stacked && {
        keys: getSortedDatasetIndices(chart, true),
        values: null
    };
class DatasetController {
 static defaults = {};
 static datasetElementType = null;
 static dataElementType = null;
 constructor(chart, datasetIndex){
        this.chart = chart;
        this._ctx = chart.ctx;
        this.index = datasetIndex;
        this._cachedDataOpts = {};
        this._cachedMeta = this.getMeta();
        this._type = this._cachedMeta.type;
        this.options = undefined;
         this._parsing = false;
        this._data = undefined;
        this._objectData = undefined;
        this._sharedOptions = undefined;
        this._drawStart = undefined;
        this._drawCount = undefined;
        this.enableOptionSharing = false;
        this.supportsDecimation = false;
        this.$context = undefined;
        this._syncList = [];
        this.datasetElementType = new.target.datasetElementType;
        this.dataElementType = new.target.dataElementType;
        this.initialize();
    }
    initialize() {
        const meta = this._cachedMeta;
        this.configure();
        this.linkScales();
        meta._stacked = isStacked(meta.vScale, meta);
        this.addElements();
        if (this.options.fill && !this.chart.isPluginEnabled('filler')) {
            console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
        }
    }
    updateIndex(datasetIndex) {
        if (this.index !== datasetIndex) {
            clearStacks(this._cachedMeta);
        }
        this.index = datasetIndex;
    }
    linkScales() {
        const chart = this.chart;
        const meta = this._cachedMeta;
        const dataset = this.getDataset();
        const chooseId = (axis, x, y, r)=>axis === 'x' ? x : axis === 'r' ? r : y;
        const xid = meta.xAxisID = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(dataset.xAxisID, getFirstScaleId(chart, 'x'));
        const yid = meta.yAxisID = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(dataset.yAxisID, getFirstScaleId(chart, 'y'));
        const rid = meta.rAxisID = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(dataset.rAxisID, getFirstScaleId(chart, 'r'));
        const indexAxis = meta.indexAxis;
        const iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid);
        const vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid);
        meta.xScale = this.getScaleForId(xid);
        meta.yScale = this.getScaleForId(yid);
        meta.rScale = this.getScaleForId(rid);
        meta.iScale = this.getScaleForId(iid);
        meta.vScale = this.getScaleForId(vid);
    }
    getDataset() {
        return this.chart.data.datasets[this.index];
    }
    getMeta() {
        return this.chart.getDatasetMeta(this.index);
    }
 getScaleForId(scaleID) {
        return this.chart.scales[scaleID];
    }
 _getOtherScale(scale) {
        const meta = this._cachedMeta;
        return scale === meta.iScale ? meta.vScale : meta.iScale;
    }
    reset() {
        this._update('reset');
    }
 _destroy() {
        const meta = this._cachedMeta;
        if (this._data) {
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.u)(this._data, this);
        }
        if (meta._stacked) {
            clearStacks(meta);
        }
    }
 _dataCheck() {
        const dataset = this.getDataset();
        const data = dataset.data || (dataset.data = []);
        const _data = this._data;
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(data)) {
            this._data = convertObjectDataToArray(data);
        } else if (_data !== data) {
            if (_data) {
                (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.u)(_data, this);
                const meta = this._cachedMeta;
                clearStacks(meta);
                meta._parsed = [];
            }
            if (data && Object.isExtensible(data)) {
                (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.l)(data, this);
            }
            this._syncList = [];
            this._data = data;
        }
    }
    addElements() {
        const meta = this._cachedMeta;
        this._dataCheck();
        if (this.datasetElementType) {
            meta.dataset = new this.datasetElementType();
        }
    }
    buildOrUpdateElements(resetNewElements) {
        const meta = this._cachedMeta;
        const dataset = this.getDataset();
        let stackChanged = false;
        this._dataCheck();
        const oldStacked = meta._stacked;
        meta._stacked = isStacked(meta.vScale, meta);
        if (meta.stack !== dataset.stack) {
            stackChanged = true;
            clearStacks(meta);
            meta.stack = dataset.stack;
        }
        this._resyncElements(resetNewElements);
        if (stackChanged || oldStacked !== meta._stacked) {
            updateStacks(this, meta._parsed);
        }
    }
 configure() {
        const config = this.chart.config;
        const scopeKeys = config.datasetScopeKeys(this._type);
        const scopes = config.getOptionScopes(this.getDataset(), scopeKeys, true);
        this.options = config.createResolver(scopes, this.getContext());
        this._parsing = this.options.parsing;
        this._cachedDataOpts = {};
    }
 parse(start, count) {
        const { _cachedMeta: meta , _data: data  } = this;
        const { iScale , _stacked  } = meta;
        const iAxis = iScale.axis;
        let sorted = start === 0 && count === data.length ? true : meta._sorted;
        let prev = start > 0 && meta._parsed[start - 1];
        let i, cur, parsed;
        if (this._parsing === false) {
            meta._parsed = data;
            meta._sorted = true;
            parsed = data;
        } else {
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(data[start])) {
                parsed = this.parseArrayData(meta, data, start, count);
            } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(data[start])) {
                parsed = this.parseObjectData(meta, data, start, count);
            } else {
                parsed = this.parsePrimitiveData(meta, data, start, count);
            }
            const isNotInOrderComparedToPrev = ()=>cur[iAxis] === null || prev && cur[iAxis] < prev[iAxis];
            for(i = 0; i < count; ++i){
                meta._parsed[i + start] = cur = parsed[i];
                if (sorted) {
                    if (isNotInOrderComparedToPrev()) {
                        sorted = false;
                    }
                    prev = cur;
                }
            }
            meta._sorted = sorted;
        }
        if (_stacked) {
            updateStacks(this, parsed);
        }
    }
 parsePrimitiveData(meta, data, start, count) {
        const { iScale , vScale  } = meta;
        const iAxis = iScale.axis;
        const vAxis = vScale.axis;
        const labels = iScale.getLabels();
        const singleScale = iScale === vScale;
        const parsed = new Array(count);
        let i, ilen, index;
        for(i = 0, ilen = count; i < ilen; ++i){
            index = i + start;
            parsed[i] = {
                [iAxis]: singleScale || iScale.parse(labels[index], index),
                [vAxis]: vScale.parse(data[index], index)
            };
        }
        return parsed;
    }
 parseArrayData(meta, data, start, count) {
        const { xScale , yScale  } = meta;
        const parsed = new Array(count);
        let i, ilen, index, item;
        for(i = 0, ilen = count; i < ilen; ++i){
            index = i + start;
            item = data[index];
            parsed[i] = {
                x: xScale.parse(item[0], index),
                y: yScale.parse(item[1], index)
            };
        }
        return parsed;
    }
 parseObjectData(meta, data, start, count) {
        const { xScale , yScale  } = meta;
        const { xAxisKey ='x' , yAxisKey ='y'  } = this._parsing;
        const parsed = new Array(count);
        let i, ilen, index, item;
        for(i = 0, ilen = count; i < ilen; ++i){
            index = i + start;
            item = data[index];
            parsed[i] = {
                x: xScale.parse((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f)(item, xAxisKey), index),
                y: yScale.parse((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f)(item, yAxisKey), index)
            };
        }
        return parsed;
    }
 getParsed(index) {
        return this._cachedMeta._parsed[index];
    }
 getDataElement(index) {
        return this._cachedMeta.data[index];
    }
 applyStack(scale, parsed, mode) {
        const chart = this.chart;
        const meta = this._cachedMeta;
        const value = parsed[scale.axis];
        const stack = {
            keys: getSortedDatasetIndices(chart, true),
            values: parsed._stacks[scale.axis]._visualValues
        };
        return applyStack(stack, value, meta.index, {
            mode
        });
    }
 updateRangeFromParsed(range, scale, parsed, stack) {
        const parsedValue = parsed[scale.axis];
        let value = parsedValue === null ? NaN : parsedValue;
        const values = stack && parsed._stacks[scale.axis];
        if (stack && values) {
            stack.values = values;
            value = applyStack(stack, parsedValue, this._cachedMeta.index);
        }
        range.min = Math.min(range.min, value);
        range.max = Math.max(range.max, value);
    }
 getMinMax(scale, canStack) {
        const meta = this._cachedMeta;
        const _parsed = meta._parsed;
        const sorted = meta._sorted && scale === meta.iScale;
        const ilen = _parsed.length;
        const otherScale = this._getOtherScale(scale);
        const stack = createStack(canStack, meta, this.chart);
        const range = {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY
        };
        const { min: otherMin , max: otherMax  } = getUserBounds(otherScale);
        let i, parsed;
        function _skip() {
            parsed = _parsed[i];
            const otherValue = parsed[otherScale.axis];
            return !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(parsed[scale.axis]) || otherMin > otherValue || otherMax < otherValue;
        }
        for(i = 0; i < ilen; ++i){
            if (_skip()) {
                continue;
            }
            this.updateRangeFromParsed(range, scale, parsed, stack);
            if (sorted) {
                break;
            }
        }
        if (sorted) {
            for(i = ilen - 1; i >= 0; --i){
                if (_skip()) {
                    continue;
                }
                this.updateRangeFromParsed(range, scale, parsed, stack);
                break;
            }
        }
        return range;
    }
    getAllParsedValues(scale) {
        const parsed = this._cachedMeta._parsed;
        const values = [];
        let i, ilen, value;
        for(i = 0, ilen = parsed.length; i < ilen; ++i){
            value = parsed[i][scale.axis];
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(value)) {
                values.push(value);
            }
        }
        return values;
    }
 getMaxOverflow() {
        return false;
    }
 getLabelAndValue(index) {
        const meta = this._cachedMeta;
        const iScale = meta.iScale;
        const vScale = meta.vScale;
        const parsed = this.getParsed(index);
        return {
            label: iScale ? '' + iScale.getLabelForValue(parsed[iScale.axis]) : '',
            value: vScale ? '' + vScale.getLabelForValue(parsed[vScale.axis]) : ''
        };
    }
 _update(mode) {
        const meta = this._cachedMeta;
        this.update(mode || 'default');
        meta._clip = toClip((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(this.options.clip, defaultClip(meta.xScale, meta.yScale, this.getMaxOverflow())));
    }
 update(mode) {}
    draw() {
        const ctx = this._ctx;
        const chart = this.chart;
        const meta = this._cachedMeta;
        const elements = meta.data || [];
        const area = chart.chartArea;
        const active = [];
        const start = this._drawStart || 0;
        const count = this._drawCount || elements.length - start;
        const drawActiveElementsOnTop = this.options.drawActiveElementsOnTop;
        let i;
        if (meta.dataset) {
            meta.dataset.draw(ctx, area, start, count);
        }
        for(i = start; i < start + count; ++i){
            const element = elements[i];
            if (element.hidden) {
                continue;
            }
            if (element.active && drawActiveElementsOnTop) {
                active.push(element);
            } else {
                element.draw(ctx, area);
            }
        }
        for(i = 0; i < active.length; ++i){
            active[i].draw(ctx, area);
        }
    }
 getStyle(index, active) {
        const mode = active ? 'active' : 'default';
        return index === undefined && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(mode) : this.resolveDataElementOptions(index || 0, mode);
    }
 getContext(index, active, mode) {
        const dataset = this.getDataset();
        let context;
        if (index >= 0 && index < this._cachedMeta.data.length) {
            const element = this._cachedMeta.data[index];
            context = element.$context || (element.$context = createDataContext(this.getContext(), index, element));
            context.parsed = this.getParsed(index);
            context.raw = dataset.data[index];
            context.index = context.dataIndex = index;
        } else {
            context = this.$context || (this.$context = createDatasetContext(this.chart.getContext(), this.index));
            context.dataset = dataset;
            context.index = context.datasetIndex = this.index;
        }
        context.active = !!active;
        context.mode = mode;
        return context;
    }
 resolveDatasetElementOptions(mode) {
        return this._resolveElementOptions(this.datasetElementType.id, mode);
    }
 resolveDataElementOptions(index, mode) {
        return this._resolveElementOptions(this.dataElementType.id, mode, index);
    }
 _resolveElementOptions(elementType, mode = 'default', index) {
        const active = mode === 'active';
        const cache = this._cachedDataOpts;
        const cacheKey = elementType + '-' + mode;
        const cached = cache[cacheKey];
        const sharing = this.enableOptionSharing && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.h)(index);
        if (cached) {
            return cloneIfNotShared(cached, sharing);
        }
        const config = this.chart.config;
        const scopeKeys = config.datasetElementScopeKeys(this._type, elementType);
        const prefixes = active ? [
            `${elementType}Hover`,
            'hover',
            elementType,
            ''
        ] : [
            elementType,
            ''
        ];
        const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
        const names = Object.keys(_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.elements[elementType]);
        const context = ()=>this.getContext(index, active, mode);
        const values = config.resolveNamedOptions(scopes, names, context, prefixes);
        if (values.$shared) {
            values.$shared = sharing;
            cache[cacheKey] = Object.freeze(cloneIfNotShared(values, sharing));
        }
        return values;
    }
 _resolveAnimations(index, transition, active) {
        const chart = this.chart;
        const cache = this._cachedDataOpts;
        const cacheKey = `animation-${transition}`;
        const cached = cache[cacheKey];
        if (cached) {
            return cached;
        }
        let options;
        if (chart.options.animation !== false) {
            const config = this.chart.config;
            const scopeKeys = config.datasetAnimationScopeKeys(this._type, transition);
            const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
            options = config.createResolver(scopes, this.getContext(index, active, transition));
        }
        const animations = new Animations(chart, options && options.animations);
        if (options && options._cacheable) {
            cache[cacheKey] = Object.freeze(animations);
        }
        return animations;
    }
 getSharedOptions(options) {
        if (!options.$shared) {
            return;
        }
        return this._sharedOptions || (this._sharedOptions = Object.assign({}, options));
    }
 includeOptions(mode, sharedOptions) {
        return !sharedOptions || isDirectUpdateMode(mode) || this.chart._animationsDisabled;
    }
 _getSharedOptions(start, mode) {
        const firstOpts = this.resolveDataElementOptions(start, mode);
        const previouslySharedOptions = this._sharedOptions;
        const sharedOptions = this.getSharedOptions(firstOpts);
        const includeOptions = this.includeOptions(mode, sharedOptions) || sharedOptions !== previouslySharedOptions;
        this.updateSharedOptions(sharedOptions, mode, firstOpts);
        return {
            sharedOptions,
            includeOptions
        };
    }
 updateElement(element, index, properties, mode) {
        if (isDirectUpdateMode(mode)) {
            Object.assign(element, properties);
        } else {
            this._resolveAnimations(index, mode).update(element, properties);
        }
    }
 updateSharedOptions(sharedOptions, mode, newOptions) {
        if (sharedOptions && !isDirectUpdateMode(mode)) {
            this._resolveAnimations(undefined, mode).update(sharedOptions, newOptions);
        }
    }
 _setStyle(element, index, mode, active) {
        element.active = active;
        const options = this.getStyle(index, active);
        this._resolveAnimations(index, mode, active).update(element, {
            options: !active && this.getSharedOptions(options) || options
        });
    }
    removeHoverStyle(element, datasetIndex, index) {
        this._setStyle(element, index, 'active', false);
    }
    setHoverStyle(element, datasetIndex, index) {
        this._setStyle(element, index, 'active', true);
    }
 _removeDatasetHoverStyle() {
        const element = this._cachedMeta.dataset;
        if (element) {
            this._setStyle(element, undefined, 'active', false);
        }
    }
 _setDatasetHoverStyle() {
        const element = this._cachedMeta.dataset;
        if (element) {
            this._setStyle(element, undefined, 'active', true);
        }
    }
 _resyncElements(resetNewElements) {
        const data = this._data;
        const elements = this._cachedMeta.data;
        for (const [method, arg1, arg2] of this._syncList){
            this[method](arg1, arg2);
        }
        this._syncList = [];
        const numMeta = elements.length;
        const numData = data.length;
        const count = Math.min(numData, numMeta);
        if (count) {
            this.parse(0, count);
        }
        if (numData > numMeta) {
            this._insertElements(numMeta, numData - numMeta, resetNewElements);
        } else if (numData < numMeta) {
            this._removeElements(numData, numMeta - numData);
        }
    }
 _insertElements(start, count, resetNewElements = true) {
        const meta = this._cachedMeta;
        const data = meta.data;
        const end = start + count;
        let i;
        const move = (arr)=>{
            arr.length += count;
            for(i = arr.length - 1; i >= end; i--){
                arr[i] = arr[i - count];
            }
        };
        move(data);
        for(i = start; i < end; ++i){
            data[i] = new this.dataElementType();
        }
        if (this._parsing) {
            move(meta._parsed);
        }
        this.parse(start, count);
        if (resetNewElements) {
            this.updateElements(data, start, count, 'reset');
        }
    }
    updateElements(element, start, count, mode) {}
 _removeElements(start, count) {
        const meta = this._cachedMeta;
        if (this._parsing) {
            const removed = meta._parsed.splice(start, count);
            if (meta._stacked) {
                clearStacks(meta, removed);
            }
        }
        meta.data.splice(start, count);
    }
 _sync(args) {
        if (this._parsing) {
            this._syncList.push(args);
        } else {
            const [method, arg1, arg2] = args;
            this[method](arg1, arg2);
        }
        this.chart._dataChanges.push([
            this.index,
            ...args
        ]);
    }
    _onDataPush() {
        const count = arguments.length;
        this._sync([
            '_insertElements',
            this.getDataset().data.length - count,
            count
        ]);
    }
    _onDataPop() {
        this._sync([
            '_removeElements',
            this._cachedMeta.data.length - 1,
            1
        ]);
    }
    _onDataShift() {
        this._sync([
            '_removeElements',
            0,
            1
        ]);
    }
    _onDataSplice(start, count) {
        if (count) {
            this._sync([
                '_removeElements',
                start,
                count
            ]);
        }
        const newCount = arguments.length - 2;
        if (newCount) {
            this._sync([
                '_insertElements',
                start,
                newCount
            ]);
        }
    }
    _onDataUnshift() {
        this._sync([
            '_insertElements',
            0,
            arguments.length
        ]);
    }
}

function getAllScaleValues(scale, type) {
    if (!scale._cache.$bar) {
        const visibleMetas = scale.getMatchingVisibleMetas(type);
        let values = [];
        for(let i = 0, ilen = visibleMetas.length; i < ilen; i++){
            values = values.concat(visibleMetas[i].controller.getAllParsedValues(scale));
        }
        scale._cache.$bar = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__._)(values.sort((a, b)=>a - b));
    }
    return scale._cache.$bar;
}
 function computeMinSampleSize(meta) {
    const scale = meta.iScale;
    const values = getAllScaleValues(scale, meta.type);
    let min = scale._length;
    let i, ilen, curr, prev;
    const updateMinAndPrev = ()=>{
        if (curr === 32767 || curr === -32768) {
            return;
        }
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.h)(prev)) {
            min = Math.min(min, Math.abs(curr - prev) || min);
        }
        prev = curr;
    };
    for(i = 0, ilen = values.length; i < ilen; ++i){
        curr = scale.getPixelForValue(values[i]);
        updateMinAndPrev();
    }
    prev = undefined;
    for(i = 0, ilen = scale.ticks.length; i < ilen; ++i){
        curr = scale.getPixelForTick(i);
        updateMinAndPrev();
    }
    return min;
}
 function computeFitCategoryTraits(index, ruler, options, stackCount) {
    const thickness = options.barThickness;
    let size, ratio;
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(thickness)) {
        size = ruler.min * options.categoryPercentage;
        ratio = options.barPercentage;
    } else {
        size = thickness * stackCount;
        ratio = 1;
    }
    return {
        chunk: size / stackCount,
        ratio,
        start: ruler.pixels[index] - size / 2
    };
}
 function computeFlexCategoryTraits(index, ruler, options, stackCount) {
    const pixels = ruler.pixels;
    const curr = pixels[index];
    let prev = index > 0 ? pixels[index - 1] : null;
    let next = index < pixels.length - 1 ? pixels[index + 1] : null;
    const percent = options.categoryPercentage;
    if (prev === null) {
        prev = curr - (next === null ? ruler.end - ruler.start : next - curr);
    }
    if (next === null) {
        next = curr + curr - prev;
    }
    const start = curr - (curr - Math.min(prev, next)) / 2 * percent;
    const size = Math.abs(next - prev) / 2 * percent;
    return {
        chunk: size / stackCount,
        ratio: options.barPercentage,
        start
    };
}
function parseFloatBar(entry, item, vScale, i) {
    const startValue = vScale.parse(entry[0], i);
    const endValue = vScale.parse(entry[1], i);
    const min = Math.min(startValue, endValue);
    const max = Math.max(startValue, endValue);
    let barStart = min;
    let barEnd = max;
    if (Math.abs(min) > Math.abs(max)) {
        barStart = max;
        barEnd = min;
    }
    item[vScale.axis] = barEnd;
    item._custom = {
        barStart,
        barEnd,
        start: startValue,
        end: endValue,
        min,
        max
    };
}
function parseValue(entry, item, vScale, i) {
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(entry)) {
        parseFloatBar(entry, item, vScale, i);
    } else {
        item[vScale.axis] = vScale.parse(entry, i);
    }
    return item;
}
function parseArrayOrPrimitive(meta, data, start, count) {
    const iScale = meta.iScale;
    const vScale = meta.vScale;
    const labels = iScale.getLabels();
    const singleScale = iScale === vScale;
    const parsed = [];
    let i, ilen, item, entry;
    for(i = start, ilen = start + count; i < ilen; ++i){
        entry = data[i];
        item = {};
        item[iScale.axis] = singleScale || iScale.parse(labels[i], i);
        parsed.push(parseValue(entry, item, vScale, i));
    }
    return parsed;
}
function isFloatBar(custom) {
    return custom && custom.barStart !== undefined && custom.barEnd !== undefined;
}
function barSign(size, vScale, actualBase) {
    if (size !== 0) {
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(size);
    }
    return (vScale.isHorizontal() ? 1 : -1) * (vScale.min >= actualBase ? 1 : -1);
}
function borderProps(properties) {
    let reverse, start, end, top, bottom;
    if (properties.horizontal) {
        reverse = properties.base > properties.x;
        start = 'left';
        end = 'right';
    } else {
        reverse = properties.base < properties.y;
        start = 'bottom';
        end = 'top';
    }
    if (reverse) {
        top = 'end';
        bottom = 'start';
    } else {
        top = 'start';
        bottom = 'end';
    }
    return {
        start,
        end,
        reverse,
        top,
        bottom
    };
}
function setBorderSkipped(properties, options, stack, index) {
    let edge = options.borderSkipped;
    const res = {};
    if (!edge) {
        properties.borderSkipped = res;
        return;
    }
    if (edge === true) {
        properties.borderSkipped = {
            top: true,
            right: true,
            bottom: true,
            left: true
        };
        return;
    }
    const { start , end , reverse , top , bottom  } = borderProps(properties);
    if (edge === 'middle' && stack) {
        properties.enableBorderRadius = true;
        if ((stack._top || 0) === index) {
            edge = top;
        } else if ((stack._bottom || 0) === index) {
            edge = bottom;
        } else {
            res[parseEdge(bottom, start, end, reverse)] = true;
            edge = top;
        }
    }
    res[parseEdge(edge, start, end, reverse)] = true;
    properties.borderSkipped = res;
}
function parseEdge(edge, a, b, reverse) {
    if (reverse) {
        edge = swap(edge, a, b);
        edge = startEnd(edge, b, a);
    } else {
        edge = startEnd(edge, a, b);
    }
    return edge;
}
function swap(orig, v1, v2) {
    return orig === v1 ? v2 : orig === v2 ? v1 : orig;
}
function startEnd(v, start, end) {
    return v === 'start' ? start : v === 'end' ? end : v;
}
function setInflateAmount(properties, { inflateAmount  }, ratio) {
    properties.inflateAmount = inflateAmount === 'auto' ? ratio === 1 ? 0.33 : 0 : inflateAmount;
}
class BarController extends DatasetController {
    static id = 'bar';
 static defaults = {
        datasetElementType: false,
        dataElementType: 'bar',
        categoryPercentage: 0.8,
        barPercentage: 0.9,
        grouped: true,
        animations: {
            numbers: {
                type: 'number',
                properties: [
                    'x',
                    'y',
                    'base',
                    'width',
                    'height'
                ]
            }
        }
    };
 static overrides = {
        scales: {
            _index_: {
                type: 'category',
                offset: true,
                grid: {
                    offset: true
                }
            },
            _value_: {
                type: 'linear',
                beginAtZero: true
            }
        }
    };
 parsePrimitiveData(meta, data, start, count) {
        return parseArrayOrPrimitive(meta, data, start, count);
    }
 parseArrayData(meta, data, start, count) {
        return parseArrayOrPrimitive(meta, data, start, count);
    }
 parseObjectData(meta, data, start, count) {
        const { iScale , vScale  } = meta;
        const { xAxisKey ='x' , yAxisKey ='y'  } = this._parsing;
        const iAxisKey = iScale.axis === 'x' ? xAxisKey : yAxisKey;
        const vAxisKey = vScale.axis === 'x' ? xAxisKey : yAxisKey;
        const parsed = [];
        let i, ilen, item, obj;
        for(i = start, ilen = start + count; i < ilen; ++i){
            obj = data[i];
            item = {};
            item[iScale.axis] = iScale.parse((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f)(obj, iAxisKey), i);
            parsed.push(parseValue((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f)(obj, vAxisKey), item, vScale, i));
        }
        return parsed;
    }
 updateRangeFromParsed(range, scale, parsed, stack) {
        super.updateRangeFromParsed(range, scale, parsed, stack);
        const custom = parsed._custom;
        if (custom && scale === this._cachedMeta.vScale) {
            range.min = Math.min(range.min, custom.min);
            range.max = Math.max(range.max, custom.max);
        }
    }
 getMaxOverflow() {
        return 0;
    }
 getLabelAndValue(index) {
        const meta = this._cachedMeta;
        const { iScale , vScale  } = meta;
        const parsed = this.getParsed(index);
        const custom = parsed._custom;
        const value = isFloatBar(custom) ? '[' + custom.start + ', ' + custom.end + ']' : '' + vScale.getLabelForValue(parsed[vScale.axis]);
        return {
            label: '' + iScale.getLabelForValue(parsed[iScale.axis]),
            value
        };
    }
    initialize() {
        this.enableOptionSharing = true;
        super.initialize();
        const meta = this._cachedMeta;
        meta.stack = this.getDataset().stack;
    }
    update(mode) {
        const meta = this._cachedMeta;
        this.updateElements(meta.data, 0, meta.data.length, mode);
    }
    updateElements(bars, start, count, mode) {
        const reset = mode === 'reset';
        const { index , _cachedMeta: { vScale  }  } = this;
        const base = vScale.getBasePixel();
        const horizontal = vScale.isHorizontal();
        const ruler = this._getRuler();
        const { sharedOptions , includeOptions  } = this._getSharedOptions(start, mode);
        for(let i = start; i < start + count; i++){
            const parsed = this.getParsed(i);
            const vpixels = reset || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(parsed[vScale.axis]) ? {
                base,
                head: base
            } : this._calculateBarValuePixels(i);
            const ipixels = this._calculateBarIndexPixels(i, ruler);
            const stack = (parsed._stacks || {})[vScale.axis];
            const properties = {
                horizontal,
                base: vpixels.base,
                enableBorderRadius: !stack || isFloatBar(parsed._custom) || index === stack._top || index === stack._bottom,
                x: horizontal ? vpixels.head : ipixels.center,
                y: horizontal ? ipixels.center : vpixels.head,
                height: horizontal ? ipixels.size : Math.abs(vpixels.size),
                width: horizontal ? Math.abs(vpixels.size) : ipixels.size
            };
            if (includeOptions) {
                properties.options = sharedOptions || this.resolveDataElementOptions(i, bars[i].active ? 'active' : mode);
            }
            const options = properties.options || bars[i].options;
            setBorderSkipped(properties, options, stack, index);
            setInflateAmount(properties, options, ruler.ratio);
            this.updateElement(bars[i], i, properties, mode);
        }
    }
 _getStacks(last, dataIndex) {
        const { iScale  } = this._cachedMeta;
        const metasets = iScale.getMatchingVisibleMetas(this._type).filter((meta)=>meta.controller.options.grouped);
        const stacked = iScale.options.stacked;
        const stacks = [];
        const skipNull = (meta)=>{
            const parsed = meta.controller.getParsed(dataIndex);
            const val = parsed && parsed[meta.vScale.axis];
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(val) || isNaN(val)) {
                return true;
            }
        };
        for (const meta of metasets){
            if (dataIndex !== undefined && skipNull(meta)) {
                continue;
            }
            if (stacked === false || stacks.indexOf(meta.stack) === -1 || stacked === undefined && meta.stack === undefined) {
                stacks.push(meta.stack);
            }
            if (meta.index === last) {
                break;
            }
        }
        if (!stacks.length) {
            stacks.push(undefined);
        }
        return stacks;
    }
 _getStackCount(index) {
        return this._getStacks(undefined, index).length;
    }
 _getStackIndex(datasetIndex, name, dataIndex) {
        const stacks = this._getStacks(datasetIndex, dataIndex);
        const index = name !== undefined ? stacks.indexOf(name) : -1;
        return index === -1 ? stacks.length - 1 : index;
    }
 _getRuler() {
        const opts = this.options;
        const meta = this._cachedMeta;
        const iScale = meta.iScale;
        const pixels = [];
        let i, ilen;
        for(i = 0, ilen = meta.data.length; i < ilen; ++i){
            pixels.push(iScale.getPixelForValue(this.getParsed(i)[iScale.axis], i));
        }
        const barThickness = opts.barThickness;
        const min = barThickness || computeMinSampleSize(meta);
        return {
            min,
            pixels,
            start: iScale._startPixel,
            end: iScale._endPixel,
            stackCount: this._getStackCount(),
            scale: iScale,
            grouped: opts.grouped,
            ratio: barThickness ? 1 : opts.categoryPercentage * opts.barPercentage
        };
    }
 _calculateBarValuePixels(index) {
        const { _cachedMeta: { vScale , _stacked , index: datasetIndex  } , options: { base: baseValue , minBarLength  }  } = this;
        const actualBase = baseValue || 0;
        const parsed = this.getParsed(index);
        const custom = parsed._custom;
        const floating = isFloatBar(custom);
        let value = parsed[vScale.axis];
        let start = 0;
        let length = _stacked ? this.applyStack(vScale, parsed, _stacked) : value;
        let head, size;
        if (length !== value) {
            start = length - value;
            length = value;
        }
        if (floating) {
            value = custom.barStart;
            length = custom.barEnd - custom.barStart;
            if (value !== 0 && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(value) !== (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(custom.barEnd)) {
                start = 0;
            }
            start += value;
        }
        const startValue = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(baseValue) && !floating ? baseValue : start;
        let base = vScale.getPixelForValue(startValue);
        if (this.chart.getDataVisibility(index)) {
            head = vScale.getPixelForValue(start + length);
        } else {
            head = base;
        }
        size = head - base;
        if (Math.abs(size) < minBarLength) {
            size = barSign(size, vScale, actualBase) * minBarLength;
            if (value === actualBase) {
                base -= size / 2;
            }
            const startPixel = vScale.getPixelForDecimal(0);
            const endPixel = vScale.getPixelForDecimal(1);
            const min = Math.min(startPixel, endPixel);
            const max = Math.max(startPixel, endPixel);
            base = Math.max(Math.min(base, max), min);
            head = base + size;
            if (_stacked && !floating) {
                parsed._stacks[vScale.axis]._visualValues[datasetIndex] = vScale.getValueForPixel(head) - vScale.getValueForPixel(base);
            }
        }
        if (base === vScale.getPixelForValue(actualBase)) {
            const halfGrid = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(size) * vScale.getLineWidthForValue(actualBase) / 2;
            base += halfGrid;
            size -= halfGrid;
        }
        return {
            size,
            base,
            head,
            center: head + size / 2
        };
    }
 _calculateBarIndexPixels(index, ruler) {
        const scale = ruler.scale;
        const options = this.options;
        const skipNull = options.skipNull;
        const maxBarThickness = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(options.maxBarThickness, Infinity);
        let center, size;
        if (ruler.grouped) {
            const stackCount = skipNull ? this._getStackCount(index) : ruler.stackCount;
            const range = options.barThickness === 'flex' ? computeFlexCategoryTraits(index, ruler, options, stackCount) : computeFitCategoryTraits(index, ruler, options, stackCount);
            const stackIndex = this._getStackIndex(this.index, this._cachedMeta.stack, skipNull ? index : undefined);
            center = range.start + range.chunk * stackIndex + range.chunk / 2;
            size = Math.min(maxBarThickness, range.chunk * range.ratio);
        } else {
            center = scale.getPixelForValue(this.getParsed(index)[scale.axis], index);
            size = Math.min(maxBarThickness, ruler.min * ruler.ratio);
        }
        return {
            base: center - size / 2,
            head: center + size / 2,
            center,
            size
        };
    }
    draw() {
        const meta = this._cachedMeta;
        const vScale = meta.vScale;
        const rects = meta.data;
        const ilen = rects.length;
        let i = 0;
        for(; i < ilen; ++i){
            if (this.getParsed(i)[vScale.axis] !== null) {
                rects[i].draw(this._ctx);
            }
        }
    }
}

class BubbleController extends DatasetController {
    static id = 'bubble';
 static defaults = {
        datasetElementType: false,
        dataElementType: 'point',
        animations: {
            numbers: {
                type: 'number',
                properties: [
                    'x',
                    'y',
                    'borderWidth',
                    'radius'
                ]
            }
        }
    };
 static overrides = {
        scales: {
            x: {
                type: 'linear'
            },
            y: {
                type: 'linear'
            }
        }
    };
    initialize() {
        this.enableOptionSharing = true;
        super.initialize();
    }
 parsePrimitiveData(meta, data, start, count) {
        const parsed = super.parsePrimitiveData(meta, data, start, count);
        for(let i = 0; i < parsed.length; i++){
            parsed[i]._custom = this.resolveDataElementOptions(i + start).radius;
        }
        return parsed;
    }
 parseArrayData(meta, data, start, count) {
        const parsed = super.parseArrayData(meta, data, start, count);
        for(let i = 0; i < parsed.length; i++){
            const item = data[start + i];
            parsed[i]._custom = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(item[2], this.resolveDataElementOptions(i + start).radius);
        }
        return parsed;
    }
 parseObjectData(meta, data, start, count) {
        const parsed = super.parseObjectData(meta, data, start, count);
        for(let i = 0; i < parsed.length; i++){
            const item = data[start + i];
            parsed[i]._custom = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(item && item.r && +item.r, this.resolveDataElementOptions(i + start).radius);
        }
        return parsed;
    }
 getMaxOverflow() {
        const data = this._cachedMeta.data;
        let max = 0;
        for(let i = data.length - 1; i >= 0; --i){
            max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
        }
        return max > 0 && max;
    }
 getLabelAndValue(index) {
        const meta = this._cachedMeta;
        const labels = this.chart.data.labels || [];
        const { xScale , yScale  } = meta;
        const parsed = this.getParsed(index);
        const x = xScale.getLabelForValue(parsed.x);
        const y = yScale.getLabelForValue(parsed.y);
        const r = parsed._custom;
        return {
            label: labels[index] || '',
            value: '(' + x + ', ' + y + (r ? ', ' + r : '') + ')'
        };
    }
    update(mode) {
        const points = this._cachedMeta.data;
        this.updateElements(points, 0, points.length, mode);
    }
    updateElements(points, start, count, mode) {
        const reset = mode === 'reset';
        const { iScale , vScale  } = this._cachedMeta;
        const { sharedOptions , includeOptions  } = this._getSharedOptions(start, mode);
        const iAxis = iScale.axis;
        const vAxis = vScale.axis;
        for(let i = start; i < start + count; i++){
            const point = points[i];
            const parsed = !reset && this.getParsed(i);
            const properties = {};
            const iPixel = properties[iAxis] = reset ? iScale.getPixelForDecimal(0.5) : iScale.getPixelForValue(parsed[iAxis]);
            const vPixel = properties[vAxis] = reset ? vScale.getBasePixel() : vScale.getPixelForValue(parsed[vAxis]);
            properties.skip = isNaN(iPixel) || isNaN(vPixel);
            if (includeOptions) {
                properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? 'active' : mode);
                if (reset) {
                    properties.options.radius = 0;
                }
            }
            this.updateElement(point, i, properties, mode);
        }
    }
 resolveDataElementOptions(index, mode) {
        const parsed = this.getParsed(index);
        let values = super.resolveDataElementOptions(index, mode);
        if (values.$shared) {
            values = Object.assign({}, values, {
                $shared: false
            });
        }
        const radius = values.radius;
        if (mode !== 'active') {
            values.radius = 0;
        }
        values.radius += (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(parsed && parsed._custom, radius);
        return values;
    }
}

function getRatioAndOffset(rotation, circumference, cutout) {
    let ratioX = 1;
    let ratioY = 1;
    let offsetX = 0;
    let offsetY = 0;
    if (circumference < _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T) {
        const startAngle = rotation;
        const endAngle = startAngle + circumference;
        const startX = Math.cos(startAngle);
        const startY = Math.sin(startAngle);
        const endX = Math.cos(endAngle);
        const endY = Math.sin(endAngle);
        const calcMax = (angle, a, b)=>(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.p)(angle, startAngle, endAngle, true) ? 1 : Math.max(a, a * cutout, b, b * cutout);
        const calcMin = (angle, a, b)=>(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.p)(angle, startAngle, endAngle, true) ? -1 : Math.min(a, a * cutout, b, b * cutout);
        const maxX = calcMax(0, startX, endX);
        const maxY = calcMax(_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H, startY, endY);
        const minX = calcMin(_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P, startX, endX);
        const minY = calcMin(_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P + _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H, startY, endY);
        ratioX = (maxX - minX) / 2;
        ratioY = (maxY - minY) / 2;
        offsetX = -(maxX + minX) / 2;
        offsetY = -(maxY + minY) / 2;
    }
    return {
        ratioX,
        ratioY,
        offsetX,
        offsetY
    };
}
class DoughnutController extends DatasetController {
    static id = 'doughnut';
 static defaults = {
        datasetElementType: false,
        dataElementType: 'arc',
        animation: {
            animateRotate: true,
            animateScale: false
        },
        animations: {
            numbers: {
                type: 'number',
                properties: [
                    'circumference',
                    'endAngle',
                    'innerRadius',
                    'outerRadius',
                    'startAngle',
                    'x',
                    'y',
                    'offset',
                    'borderWidth',
                    'spacing'
                ]
            }
        },
        cutout: '50%',
        rotation: 0,
        circumference: 360,
        radius: '100%',
        spacing: 0,
        indexAxis: 'r'
    };
    static descriptors = {
        _scriptable: (name)=>name !== 'spacing',
        _indexable: (name)=>name !== 'spacing' && !name.startsWith('borderDash') && !name.startsWith('hoverBorderDash')
    };
 static overrides = {
        aspectRatio: 1,
        plugins: {
            legend: {
                labels: {
                    generateLabels (chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            const { labels: { pointStyle , color  }  } = chart.legend.options;
                            return data.labels.map((label, i)=>{
                                const meta = chart.getDatasetMeta(0);
                                const style = meta.controller.getStyle(i);
                                return {
                                    text: label,
                                    fillStyle: style.backgroundColor,
                                    strokeStyle: style.borderColor,
                                    fontColor: color,
                                    lineWidth: style.borderWidth,
                                    pointStyle: pointStyle,
                                    hidden: !chart.getDataVisibility(i),
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                },
                onClick (e, legendItem, legend) {
                    legend.chart.toggleDataVisibility(legendItem.index);
                    legend.chart.update();
                }
            }
        }
    };
    constructor(chart, datasetIndex){
        super(chart, datasetIndex);
        this.enableOptionSharing = true;
        this.innerRadius = undefined;
        this.outerRadius = undefined;
        this.offsetX = undefined;
        this.offsetY = undefined;
    }
    linkScales() {}
 parse(start, count) {
        const data = this.getDataset().data;
        const meta = this._cachedMeta;
        if (this._parsing === false) {
            meta._parsed = data;
        } else {
            let getter = (i)=>+data[i];
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(data[start])) {
                const { key ='value'  } = this._parsing;
                getter = (i)=>+(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f)(data[i], key);
            }
            let i, ilen;
            for(i = start, ilen = start + count; i < ilen; ++i){
                meta._parsed[i] = getter(i);
            }
        }
    }
 _getRotation() {
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.options.rotation - 90);
    }
 _getCircumference() {
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.options.circumference);
    }
 _getRotationExtents() {
        let min = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T;
        let max = -_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T;
        for(let i = 0; i < this.chart.data.datasets.length; ++i){
            if (this.chart.isDatasetVisible(i) && this.chart.getDatasetMeta(i).type === this._type) {
                const controller = this.chart.getDatasetMeta(i).controller;
                const rotation = controller._getRotation();
                const circumference = controller._getCircumference();
                min = Math.min(min, rotation);
                max = Math.max(max, rotation + circumference);
            }
        }
        return {
            rotation: min,
            circumference: max - min
        };
    }
 update(mode) {
        const chart = this.chart;
        const { chartArea  } = chart;
        const meta = this._cachedMeta;
        const arcs = meta.data;
        const spacing = this.getMaxBorderWidth() + this.getMaxOffset(arcs) + this.options.spacing;
        const maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0);
        const cutout = Math.min((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.m)(this.options.cutout, maxSize), 1);
        const chartWeight = this._getRingWeight(this.index);
        const { circumference , rotation  } = this._getRotationExtents();
        const { ratioX , ratioY , offsetX , offsetY  } = getRatioAndOffset(rotation, circumference, cutout);
        const maxWidth = (chartArea.width - spacing) / ratioX;
        const maxHeight = (chartArea.height - spacing) / ratioY;
        const maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
        const outerRadius = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.n)(this.options.radius, maxRadius);
        const innerRadius = Math.max(outerRadius * cutout, 0);
        const radiusLength = (outerRadius - innerRadius) / this._getVisibleDatasetWeightTotal();
        this.offsetX = offsetX * outerRadius;
        this.offsetY = offsetY * outerRadius;
        meta.total = this.calculateTotal();
        this.outerRadius = outerRadius - radiusLength * this._getRingWeightOffset(this.index);
        this.innerRadius = Math.max(this.outerRadius - radiusLength * chartWeight, 0);
        this.updateElements(arcs, 0, arcs.length, mode);
    }
 _circumference(i, reset) {
        const opts = this.options;
        const meta = this._cachedMeta;
        const circumference = this._getCircumference();
        if (reset && opts.animation.animateRotate || !this.chart.getDataVisibility(i) || meta._parsed[i] === null || meta.data[i].hidden) {
            return 0;
        }
        return this.calculateCircumference(meta._parsed[i] * circumference / _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T);
    }
    updateElements(arcs, start, count, mode) {
        const reset = mode === 'reset';
        const chart = this.chart;
        const chartArea = chart.chartArea;
        const opts = chart.options;
        const animationOpts = opts.animation;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        const animateScale = reset && animationOpts.animateScale;
        const innerRadius = animateScale ? 0 : this.innerRadius;
        const outerRadius = animateScale ? 0 : this.outerRadius;
        const { sharedOptions , includeOptions  } = this._getSharedOptions(start, mode);
        let startAngle = this._getRotation();
        let i;
        for(i = 0; i < start; ++i){
            startAngle += this._circumference(i, reset);
        }
        for(i = start; i < start + count; ++i){
            const circumference = this._circumference(i, reset);
            const arc = arcs[i];
            const properties = {
                x: centerX + this.offsetX,
                y: centerY + this.offsetY,
                startAngle,
                endAngle: startAngle + circumference,
                circumference,
                outerRadius,
                innerRadius
            };
            if (includeOptions) {
                properties.options = sharedOptions || this.resolveDataElementOptions(i, arc.active ? 'active' : mode);
            }
            startAngle += circumference;
            this.updateElement(arc, i, properties, mode);
        }
    }
    calculateTotal() {
        const meta = this._cachedMeta;
        const metaData = meta.data;
        let total = 0;
        let i;
        for(i = 0; i < metaData.length; i++){
            const value = meta._parsed[i];
            if (value !== null && !isNaN(value) && this.chart.getDataVisibility(i) && !metaData[i].hidden) {
                total += Math.abs(value);
            }
        }
        return total;
    }
    calculateCircumference(value) {
        const total = this._cachedMeta.total;
        if (total > 0 && !isNaN(value)) {
            return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T * (Math.abs(value) / total);
        }
        return 0;
    }
    getLabelAndValue(index) {
        const meta = this._cachedMeta;
        const chart = this.chart;
        const labels = chart.data.labels || [];
        const value = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.o)(meta._parsed[index], chart.options.locale);
        return {
            label: labels[index] || '',
            value
        };
    }
    getMaxBorderWidth(arcs) {
        let max = 0;
        const chart = this.chart;
        let i, ilen, meta, controller, options;
        if (!arcs) {
            for(i = 0, ilen = chart.data.datasets.length; i < ilen; ++i){
                if (chart.isDatasetVisible(i)) {
                    meta = chart.getDatasetMeta(i);
                    arcs = meta.data;
                    controller = meta.controller;
                    break;
                }
            }
        }
        if (!arcs) {
            return 0;
        }
        for(i = 0, ilen = arcs.length; i < ilen; ++i){
            options = controller.resolveDataElementOptions(i);
            if (options.borderAlign !== 'inner') {
                max = Math.max(max, options.borderWidth || 0, options.hoverBorderWidth || 0);
            }
        }
        return max;
    }
    getMaxOffset(arcs) {
        let max = 0;
        for(let i = 0, ilen = arcs.length; i < ilen; ++i){
            const options = this.resolveDataElementOptions(i);
            max = Math.max(max, options.offset || 0, options.hoverOffset || 0);
        }
        return max;
    }
 _getRingWeightOffset(datasetIndex) {
        let ringWeightOffset = 0;
        for(let i = 0; i < datasetIndex; ++i){
            if (this.chart.isDatasetVisible(i)) {
                ringWeightOffset += this._getRingWeight(i);
            }
        }
        return ringWeightOffset;
    }
 _getRingWeight(datasetIndex) {
        return Math.max((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(this.chart.data.datasets[datasetIndex].weight, 1), 0);
    }
 _getVisibleDatasetWeightTotal() {
        return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
    }
}

class LineController extends DatasetController {
    static id = 'line';
 static defaults = {
        datasetElementType: 'line',
        dataElementType: 'point',
        showLine: true,
        spanGaps: false
    };
 static overrides = {
        scales: {
            _index_: {
                type: 'category'
            },
            _value_: {
                type: 'linear'
            }
        }
    };
    initialize() {
        this.enableOptionSharing = true;
        this.supportsDecimation = true;
        super.initialize();
    }
    update(mode) {
        const meta = this._cachedMeta;
        const { dataset: line , data: points = [] , _dataset  } = meta;
        const animationsDisabled = this.chart._animationsDisabled;
        let { start , count  } = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.q)(meta, points, animationsDisabled);
        this._drawStart = start;
        this._drawCount = count;
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.w)(meta)) {
            start = 0;
            count = points.length;
        }
        line._chart = this.chart;
        line._datasetIndex = this.index;
        line._decimated = !!_dataset._decimated;
        line.points = points;
        const options = this.resolveDatasetElementOptions(mode);
        if (!this.options.showLine) {
            options.borderWidth = 0;
        }
        options.segment = this.options.segment;
        this.updateElement(line, undefined, {
            animated: !animationsDisabled,
            options
        }, mode);
        this.updateElements(points, start, count, mode);
    }
    updateElements(points, start, count, mode) {
        const reset = mode === 'reset';
        const { iScale , vScale , _stacked , _dataset  } = this._cachedMeta;
        const { sharedOptions , includeOptions  } = this._getSharedOptions(start, mode);
        const iAxis = iScale.axis;
        const vAxis = vScale.axis;
        const { spanGaps , segment  } = this.options;
        const maxGapLength = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x)(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
        const directUpdate = this.chart._animationsDisabled || reset || mode === 'none';
        const end = start + count;
        const pointsCount = points.length;
        let prevParsed = start > 0 && this.getParsed(start - 1);
        for(let i = 0; i < pointsCount; ++i){
            const point = points[i];
            const properties = directUpdate ? point : {};
            if (i < start || i >= end) {
                properties.skip = true;
                continue;
            }
            const parsed = this.getParsed(i);
            const nullData = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(parsed[vAxis]);
            const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
            const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);
            properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
            properties.stop = i > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
            if (segment) {
                properties.parsed = parsed;
                properties.raw = _dataset.data[i];
            }
            if (includeOptions) {
                properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? 'active' : mode);
            }
            if (!directUpdate) {
                this.updateElement(point, i, properties, mode);
            }
            prevParsed = parsed;
        }
    }
 getMaxOverflow() {
        const meta = this._cachedMeta;
        const dataset = meta.dataset;
        const border = dataset.options && dataset.options.borderWidth || 0;
        const data = meta.data || [];
        if (!data.length) {
            return border;
        }
        const firstPoint = data[0].size(this.resolveDataElementOptions(0));
        const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
        return Math.max(border, firstPoint, lastPoint) / 2;
    }
    draw() {
        const meta = this._cachedMeta;
        meta.dataset.updateControlPoints(this.chart.chartArea, meta.iScale.axis);
        super.draw();
    }
}

class PolarAreaController extends DatasetController {
    static id = 'polarArea';
 static defaults = {
        dataElementType: 'arc',
        animation: {
            animateRotate: true,
            animateScale: true
        },
        animations: {
            numbers: {
                type: 'number',
                properties: [
                    'x',
                    'y',
                    'startAngle',
                    'endAngle',
                    'innerRadius',
                    'outerRadius'
                ]
            }
        },
        indexAxis: 'r',
        startAngle: 0
    };
 static overrides = {
        aspectRatio: 1,
        plugins: {
            legend: {
                labels: {
                    generateLabels (chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            const { labels: { pointStyle , color  }  } = chart.legend.options;
                            return data.labels.map((label, i)=>{
                                const meta = chart.getDatasetMeta(0);
                                const style = meta.controller.getStyle(i);
                                return {
                                    text: label,
                                    fillStyle: style.backgroundColor,
                                    strokeStyle: style.borderColor,
                                    fontColor: color,
                                    lineWidth: style.borderWidth,
                                    pointStyle: pointStyle,
                                    hidden: !chart.getDataVisibility(i),
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                },
                onClick (e, legendItem, legend) {
                    legend.chart.toggleDataVisibility(legendItem.index);
                    legend.chart.update();
                }
            }
        },
        scales: {
            r: {
                type: 'radialLinear',
                angleLines: {
                    display: false
                },
                beginAtZero: true,
                grid: {
                    circular: true
                },
                pointLabels: {
                    display: false
                },
                startAngle: 0
            }
        }
    };
    constructor(chart, datasetIndex){
        super(chart, datasetIndex);
        this.innerRadius = undefined;
        this.outerRadius = undefined;
    }
    getLabelAndValue(index) {
        const meta = this._cachedMeta;
        const chart = this.chart;
        const labels = chart.data.labels || [];
        const value = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.o)(meta._parsed[index].r, chart.options.locale);
        return {
            label: labels[index] || '',
            value
        };
    }
    parseObjectData(meta, data, start, count) {
        return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.y.bind(this)(meta, data, start, count);
    }
    update(mode) {
        const arcs = this._cachedMeta.data;
        this._updateRadius();
        this.updateElements(arcs, 0, arcs.length, mode);
    }
 getMinMax() {
        const meta = this._cachedMeta;
        const range = {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY
        };
        meta.data.forEach((element, index)=>{
            const parsed = this.getParsed(index).r;
            if (!isNaN(parsed) && this.chart.getDataVisibility(index)) {
                if (parsed < range.min) {
                    range.min = parsed;
                }
                if (parsed > range.max) {
                    range.max = parsed;
                }
            }
        });
        return range;
    }
 _updateRadius() {
        const chart = this.chart;
        const chartArea = chart.chartArea;
        const opts = chart.options;
        const minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
        const outerRadius = Math.max(minSize / 2, 0);
        const innerRadius = Math.max(opts.cutoutPercentage ? outerRadius / 100 * opts.cutoutPercentage : 1, 0);
        const radiusLength = (outerRadius - innerRadius) / chart.getVisibleDatasetCount();
        this.outerRadius = outerRadius - radiusLength * this.index;
        this.innerRadius = this.outerRadius - radiusLength;
    }
    updateElements(arcs, start, count, mode) {
        const reset = mode === 'reset';
        const chart = this.chart;
        const opts = chart.options;
        const animationOpts = opts.animation;
        const scale = this._cachedMeta.rScale;
        const centerX = scale.xCenter;
        const centerY = scale.yCenter;
        const datasetStartAngle = scale.getIndexAngle(0) - 0.5 * _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P;
        let angle = datasetStartAngle;
        let i;
        const defaultAngle = 360 / this.countVisibleElements();
        for(i = 0; i < start; ++i){
            angle += this._computeAngle(i, mode, defaultAngle);
        }
        for(i = start; i < start + count; i++){
            const arc = arcs[i];
            let startAngle = angle;
            let endAngle = angle + this._computeAngle(i, mode, defaultAngle);
            let outerRadius = chart.getDataVisibility(i) ? scale.getDistanceFromCenterForValue(this.getParsed(i).r) : 0;
            angle = endAngle;
            if (reset) {
                if (animationOpts.animateScale) {
                    outerRadius = 0;
                }
                if (animationOpts.animateRotate) {
                    startAngle = endAngle = datasetStartAngle;
                }
            }
            const properties = {
                x: centerX,
                y: centerY,
                innerRadius: 0,
                outerRadius,
                startAngle,
                endAngle,
                options: this.resolveDataElementOptions(i, arc.active ? 'active' : mode)
            };
            this.updateElement(arc, i, properties, mode);
        }
    }
    countVisibleElements() {
        const meta = this._cachedMeta;
        let count = 0;
        meta.data.forEach((element, index)=>{
            if (!isNaN(this.getParsed(index).r) && this.chart.getDataVisibility(index)) {
                count++;
            }
        });
        return count;
    }
 _computeAngle(index, mode, defaultAngle) {
        return this.chart.getDataVisibility(index) ? (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.resolveDataElementOptions(index, mode).angle || defaultAngle) : 0;
    }
}

class PieController extends DoughnutController {
    static id = 'pie';
 static defaults = {
        cutout: 0,
        rotation: 0,
        circumference: 360,
        radius: '100%'
    };
}

class RadarController extends DatasetController {
    static id = 'radar';
 static defaults = {
        datasetElementType: 'line',
        dataElementType: 'point',
        indexAxis: 'r',
        showLine: true,
        elements: {
            line: {
                fill: 'start'
            }
        }
    };
 static overrides = {
        aspectRatio: 1,
        scales: {
            r: {
                type: 'radialLinear'
            }
        }
    };
 getLabelAndValue(index) {
        const vScale = this._cachedMeta.vScale;
        const parsed = this.getParsed(index);
        return {
            label: vScale.getLabels()[index],
            value: '' + vScale.getLabelForValue(parsed[vScale.axis])
        };
    }
    parseObjectData(meta, data, start, count) {
        return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.y.bind(this)(meta, data, start, count);
    }
    update(mode) {
        const meta = this._cachedMeta;
        const line = meta.dataset;
        const points = meta.data || [];
        const labels = meta.iScale.getLabels();
        line.points = points;
        if (mode !== 'resize') {
            const options = this.resolveDatasetElementOptions(mode);
            if (!this.options.showLine) {
                options.borderWidth = 0;
            }
            const properties = {
                _loop: true,
                _fullLoop: labels.length === points.length,
                options
            };
            this.updateElement(line, undefined, properties, mode);
        }
        this.updateElements(points, 0, points.length, mode);
    }
    updateElements(points, start, count, mode) {
        const scale = this._cachedMeta.rScale;
        const reset = mode === 'reset';
        for(let i = start; i < start + count; i++){
            const point = points[i];
            const options = this.resolveDataElementOptions(i, point.active ? 'active' : mode);
            const pointPosition = scale.getPointPositionForValue(i, this.getParsed(i).r);
            const x = reset ? scale.xCenter : pointPosition.x;
            const y = reset ? scale.yCenter : pointPosition.y;
            const properties = {
                x,
                y,
                angle: pointPosition.angle,
                skip: isNaN(x) || isNaN(y),
                options
            };
            this.updateElement(point, i, properties, mode);
        }
    }
}

class ScatterController extends DatasetController {
    static id = 'scatter';
 static defaults = {
        datasetElementType: false,
        dataElementType: 'point',
        showLine: false,
        fill: false
    };
 static overrides = {
        interaction: {
            mode: 'point'
        },
        scales: {
            x: {
                type: 'linear'
            },
            y: {
                type: 'linear'
            }
        }
    };
 getLabelAndValue(index) {
        const meta = this._cachedMeta;
        const labels = this.chart.data.labels || [];
        const { xScale , yScale  } = meta;
        const parsed = this.getParsed(index);
        const x = xScale.getLabelForValue(parsed.x);
        const y = yScale.getLabelForValue(parsed.y);
        return {
            label: labels[index] || '',
            value: '(' + x + ', ' + y + ')'
        };
    }
    update(mode) {
        const meta = this._cachedMeta;
        const { data: points = []  } = meta;
        const animationsDisabled = this.chart._animationsDisabled;
        let { start , count  } = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.q)(meta, points, animationsDisabled);
        this._drawStart = start;
        this._drawCount = count;
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.w)(meta)) {
            start = 0;
            count = points.length;
        }
        if (this.options.showLine) {
            if (!this.datasetElementType) {
                this.addElements();
            }
            const { dataset: line , _dataset  } = meta;
            line._chart = this.chart;
            line._datasetIndex = this.index;
            line._decimated = !!_dataset._decimated;
            line.points = points;
            const options = this.resolveDatasetElementOptions(mode);
            options.segment = this.options.segment;
            this.updateElement(line, undefined, {
                animated: !animationsDisabled,
                options
            }, mode);
        } else if (this.datasetElementType) {
            delete meta.dataset;
            this.datasetElementType = false;
        }
        this.updateElements(points, start, count, mode);
    }
    addElements() {
        const { showLine  } = this.options;
        if (!this.datasetElementType && showLine) {
            this.datasetElementType = this.chart.registry.getElement('line');
        }
        super.addElements();
    }
    updateElements(points, start, count, mode) {
        const reset = mode === 'reset';
        const { iScale , vScale , _stacked , _dataset  } = this._cachedMeta;
        const firstOpts = this.resolveDataElementOptions(start, mode);
        const sharedOptions = this.getSharedOptions(firstOpts);
        const includeOptions = this.includeOptions(mode, sharedOptions);
        const iAxis = iScale.axis;
        const vAxis = vScale.axis;
        const { spanGaps , segment  } = this.options;
        const maxGapLength = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x)(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
        const directUpdate = this.chart._animationsDisabled || reset || mode === 'none';
        let prevParsed = start > 0 && this.getParsed(start - 1);
        for(let i = start; i < start + count; ++i){
            const point = points[i];
            const parsed = this.getParsed(i);
            const properties = directUpdate ? point : {};
            const nullData = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(parsed[vAxis]);
            const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
            const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);
            properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
            properties.stop = i > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
            if (segment) {
                properties.parsed = parsed;
                properties.raw = _dataset.data[i];
            }
            if (includeOptions) {
                properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? 'active' : mode);
            }
            if (!directUpdate) {
                this.updateElement(point, i, properties, mode);
            }
            prevParsed = parsed;
        }
        this.updateSharedOptions(sharedOptions, mode, firstOpts);
    }
 getMaxOverflow() {
        const meta = this._cachedMeta;
        const data = meta.data || [];
        if (!this.options.showLine) {
            let max = 0;
            for(let i = data.length - 1; i >= 0; --i){
                max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
            }
            return max > 0 && max;
        }
        const dataset = meta.dataset;
        const border = dataset.options && dataset.options.borderWidth || 0;
        if (!data.length) {
            return border;
        }
        const firstPoint = data[0].size(this.resolveDataElementOptions(0));
        const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
        return Math.max(border, firstPoint, lastPoint) / 2;
    }
}

var controllers = /*#__PURE__*/Object.freeze({
__proto__: null,
BarController: BarController,
BubbleController: BubbleController,
DoughnutController: DoughnutController,
LineController: LineController,
PieController: PieController,
PolarAreaController: PolarAreaController,
RadarController: RadarController,
ScatterController: ScatterController
});

/**
 * @namespace Chart._adapters
 * @since 2.8.0
 * @private
 */ function abstract() {
    throw new Error('This method is not implemented: Check that a complete date adapter is provided.');
}
/**
 * Date adapter (current used by the time scale)
 * @namespace Chart._adapters._date
 * @memberof Chart._adapters
 * @private
 */ class DateAdapterBase {
    /**
   * Override default date adapter methods.
   * Accepts type parameter to define options type.
   * @example
   * Chart._adapters._date.override<{myAdapterOption: string}>({
   *   init() {
   *     console.log(this.options.myAdapterOption);
   *   }
   * })
   */ static override(members) {
        Object.assign(DateAdapterBase.prototype, members);
    }
    options;
    constructor(options){
        this.options = options || {};
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    init() {}
    formats() {
        return abstract();
    }
    parse() {
        return abstract();
    }
    format() {
        return abstract();
    }
    add() {
        return abstract();
    }
    diff() {
        return abstract();
    }
    startOf() {
        return abstract();
    }
    endOf() {
        return abstract();
    }
}
var adapters = {
    _date: DateAdapterBase
};

function binarySearch(metaset, axis, value, intersect) {
    const { controller , data , _sorted  } = metaset;
    const iScale = controller._cachedMeta.iScale;
    if (iScale && axis === iScale.axis && axis !== 'r' && _sorted && data.length) {
        const lookupMethod = iScale._reversePixels ? _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.A : _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.B;
        if (!intersect) {
            return lookupMethod(data, axis, value);
        } else if (controller._sharedOptions) {
            const el = data[0];
            const range = typeof el.getRange === 'function' && el.getRange(axis);
            if (range) {
                const start = lookupMethod(data, axis, value - range);
                const end = lookupMethod(data, axis, value + range);
                return {
                    lo: start.lo,
                    hi: end.hi
                };
            }
        }
    }
    return {
        lo: 0,
        hi: data.length - 1
    };
}
 function evaluateInteractionItems(chart, axis, position, handler, intersect) {
    const metasets = chart.getSortedVisibleDatasetMetas();
    const value = position[axis];
    for(let i = 0, ilen = metasets.length; i < ilen; ++i){
        const { index , data  } = metasets[i];
        const { lo , hi  } = binarySearch(metasets[i], axis, value, intersect);
        for(let j = lo; j <= hi; ++j){
            const element = data[j];
            if (!element.skip) {
                handler(element, index, j);
            }
        }
    }
}
 function getDistanceMetricForAxis(axis) {
    const useX = axis.indexOf('x') !== -1;
    const useY = axis.indexOf('y') !== -1;
    return function(pt1, pt2) {
        const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
        const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
        return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    };
}
 function getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) {
    const items = [];
    if (!includeInvisible && !chart.isPointInArea(position)) {
        return items;
    }
    const evaluationFunc = function(element, datasetIndex, index) {
        if (!includeInvisible && !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)(element, chart.chartArea, 0)) {
            return;
        }
        if (element.inRange(position.x, position.y, useFinalPosition)) {
            items.push({
                element,
                datasetIndex,
                index
            });
        }
    };
    evaluateInteractionItems(chart, axis, position, evaluationFunc, true);
    return items;
}
 function getNearestRadialItems(chart, position, axis, useFinalPosition) {
    let items = [];
    function evaluationFunc(element, datasetIndex, index) {
        const { startAngle , endAngle  } = element.getProps([
            'startAngle',
            'endAngle'
        ], useFinalPosition);
        const { angle  } = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.D)(element, {
            x: position.x,
            y: position.y
        });
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.p)(angle, startAngle, endAngle)) {
            items.push({
                element,
                datasetIndex,
                index
            });
        }
    }
    evaluateInteractionItems(chart, axis, position, evaluationFunc);
    return items;
}
 function getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
    let items = [];
    const distanceMetric = getDistanceMetricForAxis(axis);
    let minDistance = Number.POSITIVE_INFINITY;
    function evaluationFunc(element, datasetIndex, index) {
        const inRange = element.inRange(position.x, position.y, useFinalPosition);
        if (intersect && !inRange) {
            return;
        }
        const center = element.getCenterPoint(useFinalPosition);
        const pointInArea = !!includeInvisible || chart.isPointInArea(center);
        if (!pointInArea && !inRange) {
            return;
        }
        const distance = distanceMetric(position, center);
        if (distance < minDistance) {
            items = [
                {
                    element,
                    datasetIndex,
                    index
                }
            ];
            minDistance = distance;
        } else if (distance === minDistance) {
            items.push({
                element,
                datasetIndex,
                index
            });
        }
    }
    evaluateInteractionItems(chart, axis, position, evaluationFunc);
    return items;
}
 function getNearestItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
    if (!includeInvisible && !chart.isPointInArea(position)) {
        return [];
    }
    return axis === 'r' && !intersect ? getNearestRadialItems(chart, position, axis, useFinalPosition) : getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible);
}
 function getAxisItems(chart, position, axis, intersect, useFinalPosition) {
    const items = [];
    const rangeMethod = axis === 'x' ? 'inXRange' : 'inYRange';
    let intersectsItem = false;
    evaluateInteractionItems(chart, axis, position, (element, datasetIndex, index)=>{
        if (element[rangeMethod](position[axis], useFinalPosition)) {
            items.push({
                element,
                datasetIndex,
                index
            });
            intersectsItem = intersectsItem || element.inRange(position.x, position.y, useFinalPosition);
        }
    });
    if (intersect && !intersectsItem) {
        return [];
    }
    return items;
}
 var Interaction = {
    evaluateInteractionItems,
    modes: {
 index (chart, e, options, useFinalPosition) {
            const position = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(e, chart);
            const axis = options.axis || 'x';
            const includeInvisible = options.includeInvisible || false;
            const items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
            const elements = [];
            if (!items.length) {
                return [];
            }
            chart.getSortedVisibleDatasetMetas().forEach((meta)=>{
                const index = items[0].index;
                const element = meta.data[index];
                if (element && !element.skip) {
                    elements.push({
                        element,
                        datasetIndex: meta.index,
                        index
                    });
                }
            });
            return elements;
        },
 dataset (chart, e, options, useFinalPosition) {
            const position = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(e, chart);
            const axis = options.axis || 'xy';
            const includeInvisible = options.includeInvisible || false;
            let items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
            if (items.length > 0) {
                const datasetIndex = items[0].datasetIndex;
                const data = chart.getDatasetMeta(datasetIndex).data;
                items = [];
                for(let i = 0; i < data.length; ++i){
                    items.push({
                        element: data[i],
                        datasetIndex,
                        index: i
                    });
                }
            }
            return items;
        },
 point (chart, e, options, useFinalPosition) {
            const position = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(e, chart);
            const axis = options.axis || 'xy';
            const includeInvisible = options.includeInvisible || false;
            return getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible);
        },
 nearest (chart, e, options, useFinalPosition) {
            const position = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(e, chart);
            const axis = options.axis || 'xy';
            const includeInvisible = options.includeInvisible || false;
            return getNearestItems(chart, position, axis, options.intersect, useFinalPosition, includeInvisible);
        },
 x (chart, e, options, useFinalPosition) {
            const position = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(e, chart);
            return getAxisItems(chart, position, 'x', options.intersect, useFinalPosition);
        },
 y (chart, e, options, useFinalPosition) {
            const position = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(e, chart);
            return getAxisItems(chart, position, 'y', options.intersect, useFinalPosition);
        }
    }
};

const STATIC_POSITIONS = [
    'left',
    'top',
    'right',
    'bottom'
];
function filterByPosition(array, position) {
    return array.filter((v)=>v.pos === position);
}
function filterDynamicPositionByAxis(array, axis) {
    return array.filter((v)=>STATIC_POSITIONS.indexOf(v.pos) === -1 && v.box.axis === axis);
}
function sortByWeight(array, reverse) {
    return array.sort((a, b)=>{
        const v0 = reverse ? b : a;
        const v1 = reverse ? a : b;
        return v0.weight === v1.weight ? v0.index - v1.index : v0.weight - v1.weight;
    });
}
function wrapBoxes(boxes) {
    const layoutBoxes = [];
    let i, ilen, box, pos, stack, stackWeight;
    for(i = 0, ilen = (boxes || []).length; i < ilen; ++i){
        box = boxes[i];
        ({ position: pos , options: { stack , stackWeight =1  }  } = box);
        layoutBoxes.push({
            index: i,
            box,
            pos,
            horizontal: box.isHorizontal(),
            weight: box.weight,
            stack: stack && pos + stack,
            stackWeight
        });
    }
    return layoutBoxes;
}
function buildStacks(layouts) {
    const stacks = {};
    for (const wrap of layouts){
        const { stack , pos , stackWeight  } = wrap;
        if (!stack || !STATIC_POSITIONS.includes(pos)) {
            continue;
        }
        const _stack = stacks[stack] || (stacks[stack] = {
            count: 0,
            placed: 0,
            weight: 0,
            size: 0
        });
        _stack.count++;
        _stack.weight += stackWeight;
    }
    return stacks;
}
 function setLayoutDims(layouts, params) {
    const stacks = buildStacks(layouts);
    const { vBoxMaxWidth , hBoxMaxHeight  } = params;
    let i, ilen, layout;
    for(i = 0, ilen = layouts.length; i < ilen; ++i){
        layout = layouts[i];
        const { fullSize  } = layout.box;
        const stack = stacks[layout.stack];
        const factor = stack && layout.stackWeight / stack.weight;
        if (layout.horizontal) {
            layout.width = factor ? factor * vBoxMaxWidth : fullSize && params.availableWidth;
            layout.height = hBoxMaxHeight;
        } else {
            layout.width = vBoxMaxWidth;
            layout.height = factor ? factor * hBoxMaxHeight : fullSize && params.availableHeight;
        }
    }
    return stacks;
}
function buildLayoutBoxes(boxes) {
    const layoutBoxes = wrapBoxes(boxes);
    const fullSize = sortByWeight(layoutBoxes.filter((wrap)=>wrap.box.fullSize), true);
    const left = sortByWeight(filterByPosition(layoutBoxes, 'left'), true);
    const right = sortByWeight(filterByPosition(layoutBoxes, 'right'));
    const top = sortByWeight(filterByPosition(layoutBoxes, 'top'), true);
    const bottom = sortByWeight(filterByPosition(layoutBoxes, 'bottom'));
    const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, 'x');
    const centerVertical = filterDynamicPositionByAxis(layoutBoxes, 'y');
    return {
        fullSize,
        leftAndTop: left.concat(top),
        rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal),
        chartArea: filterByPosition(layoutBoxes, 'chartArea'),
        vertical: left.concat(right).concat(centerVertical),
        horizontal: top.concat(bottom).concat(centerHorizontal)
    };
}
function getCombinedMax(maxPadding, chartArea, a, b) {
    return Math.max(maxPadding[a], chartArea[a]) + Math.max(maxPadding[b], chartArea[b]);
}
function updateMaxPadding(maxPadding, boxPadding) {
    maxPadding.top = Math.max(maxPadding.top, boxPadding.top);
    maxPadding.left = Math.max(maxPadding.left, boxPadding.left);
    maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom);
    maxPadding.right = Math.max(maxPadding.right, boxPadding.right);
}
function updateDims(chartArea, params, layout, stacks) {
    const { pos , box  } = layout;
    const maxPadding = chartArea.maxPadding;
    if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(pos)) {
        if (layout.size) {
            chartArea[pos] -= layout.size;
        }
        const stack = stacks[layout.stack] || {
            size: 0,
            count: 1
        };
        stack.size = Math.max(stack.size, layout.horizontal ? box.height : box.width);
        layout.size = stack.size / stack.count;
        chartArea[pos] += layout.size;
    }
    if (box.getPadding) {
        updateMaxPadding(maxPadding, box.getPadding());
    }
    const newWidth = Math.max(0, params.outerWidth - getCombinedMax(maxPadding, chartArea, 'left', 'right'));
    const newHeight = Math.max(0, params.outerHeight - getCombinedMax(maxPadding, chartArea, 'top', 'bottom'));
    const widthChanged = newWidth !== chartArea.w;
    const heightChanged = newHeight !== chartArea.h;
    chartArea.w = newWidth;
    chartArea.h = newHeight;
    return layout.horizontal ? {
        same: widthChanged,
        other: heightChanged
    } : {
        same: heightChanged,
        other: widthChanged
    };
}
function handleMaxPadding(chartArea) {
    const maxPadding = chartArea.maxPadding;
    function updatePos(pos) {
        const change = Math.max(maxPadding[pos] - chartArea[pos], 0);
        chartArea[pos] += change;
        return change;
    }
    chartArea.y += updatePos('top');
    chartArea.x += updatePos('left');
    updatePos('right');
    updatePos('bottom');
}
function getMargins(horizontal, chartArea) {
    const maxPadding = chartArea.maxPadding;
    function marginForPositions(positions) {
        const margin = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        };
        positions.forEach((pos)=>{
            margin[pos] = Math.max(chartArea[pos], maxPadding[pos]);
        });
        return margin;
    }
    return horizontal ? marginForPositions([
        'left',
        'right'
    ]) : marginForPositions([
        'top',
        'bottom'
    ]);
}
function fitBoxes(boxes, chartArea, params, stacks) {
    const refitBoxes = [];
    let i, ilen, layout, box, refit, changed;
    for(i = 0, ilen = boxes.length, refit = 0; i < ilen; ++i){
        layout = boxes[i];
        box = layout.box;
        box.update(layout.width || chartArea.w, layout.height || chartArea.h, getMargins(layout.horizontal, chartArea));
        const { same , other  } = updateDims(chartArea, params, layout, stacks);
        refit |= same && refitBoxes.length;
        changed = changed || other;
        if (!box.fullSize) {
            refitBoxes.push(layout);
        }
    }
    return refit && fitBoxes(refitBoxes, chartArea, params, stacks) || changed;
}
function setBoxDims(box, left, top, width, height) {
    box.top = top;
    box.left = left;
    box.right = left + width;
    box.bottom = top + height;
    box.width = width;
    box.height = height;
}
function placeBoxes(boxes, chartArea, params, stacks) {
    const userPadding = params.padding;
    let { x , y  } = chartArea;
    for (const layout of boxes){
        const box = layout.box;
        const stack = stacks[layout.stack] || {
            count: 1,
            placed: 0,
            weight: 1
        };
        const weight = layout.stackWeight / stack.weight || 1;
        if (layout.horizontal) {
            const width = chartArea.w * weight;
            const height = stack.size || box.height;
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.h)(stack.start)) {
                y = stack.start;
            }
            if (box.fullSize) {
                setBoxDims(box, userPadding.left, y, params.outerWidth - userPadding.right - userPadding.left, height);
            } else {
                setBoxDims(box, chartArea.left + stack.placed, y, width, height);
            }
            stack.start = y;
            stack.placed += width;
            y = box.bottom;
        } else {
            const height = chartArea.h * weight;
            const width = stack.size || box.width;
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.h)(stack.start)) {
                x = stack.start;
            }
            if (box.fullSize) {
                setBoxDims(box, x, userPadding.top, width, params.outerHeight - userPadding.bottom - userPadding.top);
            } else {
                setBoxDims(box, x, chartArea.top + stack.placed, width, height);
            }
            stack.start = x;
            stack.placed += height;
            x = box.right;
        }
    }
    chartArea.x = x;
    chartArea.y = y;
}
var layouts = {
 addBox (chart, item) {
        if (!chart.boxes) {
            chart.boxes = [];
        }
        item.fullSize = item.fullSize || false;
        item.position = item.position || 'top';
        item.weight = item.weight || 0;
        item._layers = item._layers || function() {
            return [
                {
                    z: 0,
                    draw (chartArea) {
                        item.draw(chartArea);
                    }
                }
            ];
        };
        chart.boxes.push(item);
    },
 removeBox (chart, layoutItem) {
        const index = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1;
        if (index !== -1) {
            chart.boxes.splice(index, 1);
        }
    },
 configure (chart, item, options) {
        item.fullSize = options.fullSize;
        item.position = options.position;
        item.weight = options.weight;
    },
 update (chart, width, height, minPadding) {
        if (!chart) {
            return;
        }
        const padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(chart.options.layout.padding);
        const availableWidth = Math.max(width - padding.width, 0);
        const availableHeight = Math.max(height - padding.height, 0);
        const boxes = buildLayoutBoxes(chart.boxes);
        const verticalBoxes = boxes.vertical;
        const horizontalBoxes = boxes.horizontal;
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(chart.boxes, (box)=>{
            if (typeof box.beforeLayout === 'function') {
                box.beforeLayout();
            }
        });
        const visibleVerticalBoxCount = verticalBoxes.reduce((total, wrap)=>wrap.box.options && wrap.box.options.display === false ? total : total + 1, 0) || 1;
        const params = Object.freeze({
            outerWidth: width,
            outerHeight: height,
            padding,
            availableWidth,
            availableHeight,
            vBoxMaxWidth: availableWidth / 2 / visibleVerticalBoxCount,
            hBoxMaxHeight: availableHeight / 2
        });
        const maxPadding = Object.assign({}, padding);
        updateMaxPadding(maxPadding, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(minPadding));
        const chartArea = Object.assign({
            maxPadding,
            w: availableWidth,
            h: availableHeight,
            x: padding.left,
            y: padding.top
        }, padding);
        const stacks = setLayoutDims(verticalBoxes.concat(horizontalBoxes), params);
        fitBoxes(boxes.fullSize, chartArea, params, stacks);
        fitBoxes(verticalBoxes, chartArea, params, stacks);
        if (fitBoxes(horizontalBoxes, chartArea, params, stacks)) {
            fitBoxes(verticalBoxes, chartArea, params, stacks);
        }
        handleMaxPadding(chartArea);
        placeBoxes(boxes.leftAndTop, chartArea, params, stacks);
        chartArea.x += chartArea.w;
        chartArea.y += chartArea.h;
        placeBoxes(boxes.rightAndBottom, chartArea, params, stacks);
        chart.chartArea = {
            left: chartArea.left,
            top: chartArea.top,
            right: chartArea.left + chartArea.w,
            bottom: chartArea.top + chartArea.h,
            height: chartArea.h,
            width: chartArea.w
        };
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(boxes.chartArea, (layout)=>{
            const box = layout.box;
            Object.assign(box, chart.chartArea);
            box.update(chartArea.w, chartArea.h, {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            });
        });
    }
};

class BasePlatform {
 acquireContext(canvas, aspectRatio) {}
 releaseContext(context) {
        return false;
    }
 addEventListener(chart, type, listener) {}
 removeEventListener(chart, type, listener) {}
 getDevicePixelRatio() {
        return 1;
    }
 getMaximumSize(element, width, height, aspectRatio) {
        width = Math.max(0, width || element.width);
        height = height || element.height;
        return {
            width,
            height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
        };
    }
 isAttached(canvas) {
        return true;
    }
 updateConfig(config) {
    }
}

class BasicPlatform extends BasePlatform {
    acquireContext(item) {
        return item && item.getContext && item.getContext('2d') || null;
    }
    updateConfig(config) {
        config.options.animation = false;
    }
}

const EXPANDO_KEY = '$chartjs';
 const EVENT_TYPES = {
    touchstart: 'mousedown',
    touchmove: 'mousemove',
    touchend: 'mouseup',
    pointerenter: 'mouseenter',
    pointerdown: 'mousedown',
    pointermove: 'mousemove',
    pointerup: 'mouseup',
    pointerleave: 'mouseout',
    pointerout: 'mouseout'
};
const isNullOrEmpty = (value)=>value === null || value === '';
 function initCanvas(canvas, aspectRatio) {
    const style = canvas.style;
    const renderHeight = canvas.getAttribute('height');
    const renderWidth = canvas.getAttribute('width');
    canvas[EXPANDO_KEY] = {
        initial: {
            height: renderHeight,
            width: renderWidth,
            style: {
                display: style.display,
                height: style.height,
                width: style.width
            }
        }
    };
    style.display = style.display || 'block';
    style.boxSizing = style.boxSizing || 'border-box';
    if (isNullOrEmpty(renderWidth)) {
        const displayWidth = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.J)(canvas, 'width');
        if (displayWidth !== undefined) {
            canvas.width = displayWidth;
        }
    }
    if (isNullOrEmpty(renderHeight)) {
        if (canvas.style.height === '') {
            canvas.height = canvas.width / (aspectRatio || 2);
        } else {
            const displayHeight = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.J)(canvas, 'height');
            if (displayHeight !== undefined) {
                canvas.height = displayHeight;
            }
        }
    }
    return canvas;
}
const eventListenerOptions = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.K ? {
    passive: true
} : false;
function addListener(node, type, listener) {
    node.addEventListener(type, listener, eventListenerOptions);
}
function removeListener(chart, type, listener) {
    chart.canvas.removeEventListener(type, listener, eventListenerOptions);
}
function fromNativeEvent(event, chart) {
    const type = EVENT_TYPES[event.type] || event.type;
    const { x , y  } = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(event, chart);
    return {
        type,
        chart,
        native: event,
        x: x !== undefined ? x : null,
        y: y !== undefined ? y : null
    };
}
function nodeListContains(nodeList, canvas) {
    for (const node of nodeList){
        if (node === canvas || node.contains(canvas)) {
            return true;
        }
    }
}
function createAttachObserver(chart, type, listener) {
    const canvas = chart.canvas;
    const observer = new MutationObserver((entries)=>{
        let trigger = false;
        for (const entry of entries){
            trigger = trigger || nodeListContains(entry.addedNodes, canvas);
            trigger = trigger && !nodeListContains(entry.removedNodes, canvas);
        }
        if (trigger) {
            listener();
        }
    });
    observer.observe(document, {
        childList: true,
        subtree: true
    });
    return observer;
}
function createDetachObserver(chart, type, listener) {
    const canvas = chart.canvas;
    const observer = new MutationObserver((entries)=>{
        let trigger = false;
        for (const entry of entries){
            trigger = trigger || nodeListContains(entry.removedNodes, canvas);
            trigger = trigger && !nodeListContains(entry.addedNodes, canvas);
        }
        if (trigger) {
            listener();
        }
    });
    observer.observe(document, {
        childList: true,
        subtree: true
    });
    return observer;
}
const drpListeningCharts = new Map();
let oldDevicePixelRatio = 0;
function onWindowResize() {
    const dpr = window.devicePixelRatio;
    if (dpr === oldDevicePixelRatio) {
        return;
    }
    oldDevicePixelRatio = dpr;
    drpListeningCharts.forEach((resize, chart)=>{
        if (chart.currentDevicePixelRatio !== dpr) {
            resize();
        }
    });
}
function listenDevicePixelRatioChanges(chart, resize) {
    if (!drpListeningCharts.size) {
        window.addEventListener('resize', onWindowResize);
    }
    drpListeningCharts.set(chart, resize);
}
function unlistenDevicePixelRatioChanges(chart) {
    drpListeningCharts.delete(chart);
    if (!drpListeningCharts.size) {
        window.removeEventListener('resize', onWindowResize);
    }
}
function createResizeObserver(chart, type, listener) {
    const canvas = chart.canvas;
    const container = canvas && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.I)(canvas);
    if (!container) {
        return;
    }
    const resize = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.L)((width, height)=>{
        const w = container.clientWidth;
        listener(width, height);
        if (w < container.clientWidth) {
            listener();
        }
    }, window);
    const observer = new ResizeObserver((entries)=>{
        const entry = entries[0];
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        if (width === 0 && height === 0) {
            return;
        }
        resize(width, height);
    });
    observer.observe(container);
    listenDevicePixelRatioChanges(chart, resize);
    return observer;
}
function releaseObserver(chart, type, observer) {
    if (observer) {
        observer.disconnect();
    }
    if (type === 'resize') {
        unlistenDevicePixelRatioChanges(chart);
    }
}
function createProxyAndListen(chart, type, listener) {
    const canvas = chart.canvas;
    const proxy = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.L)((event)=>{
        if (chart.ctx !== null) {
            listener(fromNativeEvent(event, chart));
        }
    }, chart);
    addListener(canvas, type, proxy);
    return proxy;
}
 class DomPlatform extends BasePlatform {
 acquireContext(canvas, aspectRatio) {
        const context = canvas && canvas.getContext && canvas.getContext('2d');
        if (context && context.canvas === canvas) {
            initCanvas(canvas, aspectRatio);
            return context;
        }
        return null;
    }
 releaseContext(context) {
        const canvas = context.canvas;
        if (!canvas[EXPANDO_KEY]) {
            return false;
        }
        const initial = canvas[EXPANDO_KEY].initial;
        [
            'height',
            'width'
        ].forEach((prop)=>{
            const value = initial[prop];
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(value)) {
                canvas.removeAttribute(prop);
            } else {
                canvas.setAttribute(prop, value);
            }
        });
        const style = initial.style || {};
        Object.keys(style).forEach((key)=>{
            canvas.style[key] = style[key];
        });
        canvas.width = canvas.width;
        delete canvas[EXPANDO_KEY];
        return true;
    }
 addEventListener(chart, type, listener) {
        this.removeEventListener(chart, type);
        const proxies = chart.$proxies || (chart.$proxies = {});
        const handlers = {
            attach: createAttachObserver,
            detach: createDetachObserver,
            resize: createResizeObserver
        };
        const handler = handlers[type] || createProxyAndListen;
        proxies[type] = handler(chart, type, listener);
    }
 removeEventListener(chart, type) {
        const proxies = chart.$proxies || (chart.$proxies = {});
        const proxy = proxies[type];
        if (!proxy) {
            return;
        }
        const handlers = {
            attach: releaseObserver,
            detach: releaseObserver,
            resize: releaseObserver
        };
        const handler = handlers[type] || removeListener;
        handler(chart, type, proxy);
        proxies[type] = undefined;
    }
    getDevicePixelRatio() {
        return window.devicePixelRatio;
    }
 getMaximumSize(canvas, width, height, aspectRatio) {
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.G)(canvas, width, height, aspectRatio);
    }
 isAttached(canvas) {
        const container = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.I)(canvas);
        return !!(container && container.isConnected);
    }
}

function _detectPlatform(canvas) {
    if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.M)() || typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
        return BasicPlatform;
    }
    return DomPlatform;
}

class Element {
    static defaults = {};
    static defaultRoutes = undefined;
    x;
    y;
    active = false;
    options;
    $animations;
    tooltipPosition(useFinalPosition) {
        const { x , y  } = this.getProps([
            'x',
            'y'
        ], useFinalPosition);
        return {
            x,
            y
        };
    }
    hasValue() {
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x)(this.x) && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x)(this.y);
    }
    getProps(props, final) {
        const anims = this.$animations;
        if (!final || !anims) {
            // let's not create an object, if not needed
            return this;
        }
        const ret = {};
        props.forEach((prop)=>{
            ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : this[prop];
        });
        return ret;
    }
}

function autoSkip(scale, ticks) {
    const tickOpts = scale.options.ticks;
    const determinedMaxTicks = determineMaxTicks(scale);
    const ticksLimit = Math.min(tickOpts.maxTicksLimit || determinedMaxTicks, determinedMaxTicks);
    const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
    const numMajorIndices = majorIndices.length;
    const first = majorIndices[0];
    const last = majorIndices[numMajorIndices - 1];
    const newTicks = [];
    if (numMajorIndices > ticksLimit) {
        skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
        return newTicks;
    }
    const spacing = calculateSpacing(majorIndices, ticks, ticksLimit);
    if (numMajorIndices > 0) {
        let i, ilen;
        const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
        skip(ticks, newTicks, spacing, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first);
        for(i = 0, ilen = numMajorIndices - 1; i < ilen; i++){
            skip(ticks, newTicks, spacing, majorIndices[i], majorIndices[i + 1]);
        }
        skip(ticks, newTicks, spacing, last, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing);
        return newTicks;
    }
    skip(ticks, newTicks, spacing);
    return newTicks;
}
function determineMaxTicks(scale) {
    const offset = scale.options.offset;
    const tickLength = scale._tickSize();
    const maxScale = scale._length / tickLength + (offset ? 0 : 1);
    const maxChart = scale._maxLength / tickLength;
    return Math.floor(Math.min(maxScale, maxChart));
}
 function calculateSpacing(majorIndices, ticks, ticksLimit) {
    const evenMajorSpacing = getEvenSpacing(majorIndices);
    const spacing = ticks.length / ticksLimit;
    if (!evenMajorSpacing) {
        return Math.max(spacing, 1);
    }
    const factors = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.N)(evenMajorSpacing);
    for(let i = 0, ilen = factors.length - 1; i < ilen; i++){
        const factor = factors[i];
        if (factor > spacing) {
            return factor;
        }
    }
    return Math.max(spacing, 1);
}
 function getMajorIndices(ticks) {
    const result = [];
    let i, ilen;
    for(i = 0, ilen = ticks.length; i < ilen; i++){
        if (ticks[i].major) {
            result.push(i);
        }
    }
    return result;
}
 function skipMajors(ticks, newTicks, majorIndices, spacing) {
    let count = 0;
    let next = majorIndices[0];
    let i;
    spacing = Math.ceil(spacing);
    for(i = 0; i < ticks.length; i++){
        if (i === next) {
            newTicks.push(ticks[i]);
            count++;
            next = majorIndices[count * spacing];
        }
    }
}
 function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
    const start = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(majorStart, 0);
    const end = Math.min((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(majorEnd, ticks.length), ticks.length);
    let count = 0;
    let length, i, next;
    spacing = Math.ceil(spacing);
    if (majorEnd) {
        length = majorEnd - majorStart;
        spacing = length / Math.floor(length / spacing);
    }
    next = start;
    while(next < 0){
        count++;
        next = Math.round(start + count * spacing);
    }
    for(i = Math.max(start, 0); i < end; i++){
        if (i === next) {
            newTicks.push(ticks[i]);
            count++;
            next = Math.round(start + count * spacing);
        }
    }
}
 function getEvenSpacing(arr) {
    const len = arr.length;
    let i, diff;
    if (len < 2) {
        return false;
    }
    for(diff = arr[0], i = 1; i < len; ++i){
        if (arr[i] - arr[i - 1] !== diff) {
            return false;
        }
    }
    return diff;
}

const reverseAlign = (align)=>align === 'left' ? 'right' : align === 'right' ? 'left' : align;
const offsetFromEdge = (scale, edge, offset)=>edge === 'top' || edge === 'left' ? scale[edge] + offset : scale[edge] - offset;
const getTicksLimit = (ticksLength, maxTicksLimit)=>Math.min(maxTicksLimit || ticksLength, ticksLength);
 function sample(arr, numItems) {
    const result = [];
    const increment = arr.length / numItems;
    const len = arr.length;
    let i = 0;
    for(; i < len; i += increment){
        result.push(arr[Math.floor(i)]);
    }
    return result;
}
 function getPixelForGridLine(scale, index, offsetGridLines) {
    const length = scale.ticks.length;
    const validIndex = Math.min(index, length - 1);
    const start = scale._startPixel;
    const end = scale._endPixel;
    const epsilon = 1e-6;
    let lineValue = scale.getPixelForTick(validIndex);
    let offset;
    if (offsetGridLines) {
        if (length === 1) {
            offset = Math.max(lineValue - start, end - lineValue);
        } else if (index === 0) {
            offset = (scale.getPixelForTick(1) - lineValue) / 2;
        } else {
            offset = (lineValue - scale.getPixelForTick(validIndex - 1)) / 2;
        }
        lineValue += validIndex < index ? offset : -offset;
        if (lineValue < start - epsilon || lineValue > end + epsilon) {
            return;
        }
    }
    return lineValue;
}
 function garbageCollect(caches, length) {
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(caches, (cache)=>{
        const gc = cache.gc;
        const gcLen = gc.length / 2;
        let i;
        if (gcLen > length) {
            for(i = 0; i < gcLen; ++i){
                delete cache.data[gc[i]];
            }
            gc.splice(0, gcLen);
        }
    });
}
 function getTickMarkLength(options) {
    return options.drawTicks ? options.tickLength : 0;
}
 function getTitleHeight(options, fallback) {
    if (!options.display) {
        return 0;
    }
    const font = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.font, fallback);
    const padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(options.padding);
    const lines = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(options.text) ? options.text.length : 1;
    return lines * font.lineHeight + padding.height;
}
function createScaleContext(parent, scale) {
    return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(parent, {
        scale,
        type: 'scale'
    });
}
function createTickContext(parent, index, tick) {
    return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(parent, {
        tick,
        index,
        type: 'tick'
    });
}
function titleAlign(align, position, reverse) {
     let ret = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a1)(align);
    if (reverse && position !== 'right' || !reverse && position === 'right') {
        ret = reverseAlign(ret);
    }
    return ret;
}
function titleArgs(scale, offset, position, align) {
    const { top , left , bottom , right , chart  } = scale;
    const { chartArea , scales  } = chart;
    let rotation = 0;
    let maxWidth, titleX, titleY;
    const height = bottom - top;
    const width = right - left;
    if (scale.isHorizontal()) {
        titleX = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, left, right);
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
            const positionAxisID = Object.keys(position)[0];
            const value = position[positionAxisID];
            titleY = scales[positionAxisID].getPixelForValue(value) + height - offset;
        } else if (position === 'center') {
            titleY = (chartArea.bottom + chartArea.top) / 2 + height - offset;
        } else {
            titleY = offsetFromEdge(scale, position, offset);
        }
        maxWidth = right - left;
    } else {
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
            const positionAxisID = Object.keys(position)[0];
            const value = position[positionAxisID];
            titleX = scales[positionAxisID].getPixelForValue(value) - width + offset;
        } else if (position === 'center') {
            titleX = (chartArea.left + chartArea.right) / 2 - width + offset;
        } else {
            titleX = offsetFromEdge(scale, position, offset);
        }
        titleY = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, bottom, top);
        rotation = position === 'left' ? -_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H : _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H;
    }
    return {
        titleX,
        titleY,
        maxWidth,
        rotation
    };
}
class Scale extends Element {
    constructor(cfg){
        super();
         this.id = cfg.id;
         this.type = cfg.type;
         this.options = undefined;
         this.ctx = cfg.ctx;
         this.chart = cfg.chart;
         this.top = undefined;
         this.bottom = undefined;
         this.left = undefined;
         this.right = undefined;
         this.width = undefined;
         this.height = undefined;
        this._margins = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };
         this.maxWidth = undefined;
         this.maxHeight = undefined;
         this.paddingTop = undefined;
         this.paddingBottom = undefined;
         this.paddingLeft = undefined;
         this.paddingRight = undefined;
         this.axis = undefined;
         this.labelRotation = undefined;
        this.min = undefined;
        this.max = undefined;
        this._range = undefined;
         this.ticks = [];
         this._gridLineItems = null;
         this._labelItems = null;
         this._labelSizes = null;
        this._length = 0;
        this._maxLength = 0;
        this._longestTextCache = {};
         this._startPixel = undefined;
         this._endPixel = undefined;
        this._reversePixels = false;
        this._userMax = undefined;
        this._userMin = undefined;
        this._suggestedMax = undefined;
        this._suggestedMin = undefined;
        this._ticksLength = 0;
        this._borderValue = 0;
        this._cache = {};
        this._dataLimitsCached = false;
        this.$context = undefined;
    }
 init(options) {
        this.options = options.setContext(this.getContext());
        this.axis = options.axis;
        this._userMin = this.parse(options.min);
        this._userMax = this.parse(options.max);
        this._suggestedMin = this.parse(options.suggestedMin);
        this._suggestedMax = this.parse(options.suggestedMax);
    }
 parse(raw, index) {
        return raw;
    }
 getUserBounds() {
        let { _userMin , _userMax , _suggestedMin , _suggestedMax  } = this;
        _userMin = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(_userMin, Number.POSITIVE_INFINITY);
        _userMax = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(_userMax, Number.NEGATIVE_INFINITY);
        _suggestedMin = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(_suggestedMin, Number.POSITIVE_INFINITY);
        _suggestedMax = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(_suggestedMax, Number.NEGATIVE_INFINITY);
        return {
            min: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(_userMin, _suggestedMin),
            max: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(_userMax, _suggestedMax),
            minDefined: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(_userMin),
            maxDefined: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(_userMax)
        };
    }
 getMinMax(canStack) {
        let { min , max , minDefined , maxDefined  } = this.getUserBounds();
        let range;
        if (minDefined && maxDefined) {
            return {
                min,
                max
            };
        }
        const metas = this.getMatchingVisibleMetas();
        for(let i = 0, ilen = metas.length; i < ilen; ++i){
            range = metas[i].controller.getMinMax(this, canStack);
            if (!minDefined) {
                min = Math.min(min, range.min);
            }
            if (!maxDefined) {
                max = Math.max(max, range.max);
            }
        }
        min = maxDefined && min > max ? max : min;
        max = minDefined && min > max ? min : max;
        return {
            min: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(min, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(max, min)),
            max: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(max, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(min, max))
        };
    }
 getPadding() {
        return {
            left: this.paddingLeft || 0,
            top: this.paddingTop || 0,
            right: this.paddingRight || 0,
            bottom: this.paddingBottom || 0
        };
    }
 getTicks() {
        return this.ticks;
    }
 getLabels() {
        const data = this.chart.data;
        return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
    }
 getLabelItems(chartArea = this.chart.chartArea) {
        const items = this._labelItems || (this._labelItems = this._computeLabelItems(chartArea));
        return items;
    }
    beforeLayout() {
        this._cache = {};
        this._dataLimitsCached = false;
    }
    beforeUpdate() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.beforeUpdate, [
            this
        ]);
    }
 update(maxWidth, maxHeight, margins) {
        const { beginAtZero , grace , ticks: tickOpts  } = this.options;
        const sampleSize = tickOpts.sampleSize;
        this.beforeUpdate();
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this._margins = margins = Object.assign({
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        }, margins);
        this.ticks = null;
        this._labelSizes = null;
        this._gridLineItems = null;
        this._labelItems = null;
        this.beforeSetDimensions();
        this.setDimensions();
        this.afterSetDimensions();
        this._maxLength = this.isHorizontal() ? this.width + margins.left + margins.right : this.height + margins.top + margins.bottom;
        if (!this._dataLimitsCached) {
            this.beforeDataLimits();
            this.determineDataLimits();
            this.afterDataLimits();
            this._range = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.R)(this, grace, beginAtZero);
            this._dataLimitsCached = true;
        }
        this.beforeBuildTicks();
        this.ticks = this.buildTicks() || [];
        this.afterBuildTicks();
        const samplingEnabled = sampleSize < this.ticks.length;
        this._convertTicksToLabels(samplingEnabled ? sample(this.ticks, sampleSize) : this.ticks);
        this.configure();
        this.beforeCalculateLabelRotation();
        this.calculateLabelRotation();
        this.afterCalculateLabelRotation();
        if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === 'auto')) {
            this.ticks = autoSkip(this, this.ticks);
            this._labelSizes = null;
            this.afterAutoSkip();
        }
        if (samplingEnabled) {
            this._convertTicksToLabels(this.ticks);
        }
        this.beforeFit();
        this.fit();
        this.afterFit();
        this.afterUpdate();
    }
 configure() {
        let reversePixels = this.options.reverse;
        let startPixel, endPixel;
        if (this.isHorizontal()) {
            startPixel = this.left;
            endPixel = this.right;
        } else {
            startPixel = this.top;
            endPixel = this.bottom;
            reversePixels = !reversePixels;
        }
        this._startPixel = startPixel;
        this._endPixel = endPixel;
        this._reversePixels = reversePixels;
        this._length = endPixel - startPixel;
        this._alignToPixels = this.options.alignToPixels;
    }
    afterUpdate() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.afterUpdate, [
            this
        ]);
    }
    beforeSetDimensions() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.beforeSetDimensions, [
            this
        ]);
    }
    setDimensions() {
        if (this.isHorizontal()) {
            this.width = this.maxWidth;
            this.left = 0;
            this.right = this.width;
        } else {
            this.height = this.maxHeight;
            this.top = 0;
            this.bottom = this.height;
        }
        this.paddingLeft = 0;
        this.paddingTop = 0;
        this.paddingRight = 0;
        this.paddingBottom = 0;
    }
    afterSetDimensions() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.afterSetDimensions, [
            this
        ]);
    }
    _callHooks(name) {
        this.chart.notifyPlugins(name, this.getContext());
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options[name], [
            this
        ]);
    }
    beforeDataLimits() {
        this._callHooks('beforeDataLimits');
    }
    determineDataLimits() {}
    afterDataLimits() {
        this._callHooks('afterDataLimits');
    }
    beforeBuildTicks() {
        this._callHooks('beforeBuildTicks');
    }
 buildTicks() {
        return [];
    }
    afterBuildTicks() {
        this._callHooks('afterBuildTicks');
    }
    beforeTickToLabelConversion() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.beforeTickToLabelConversion, [
            this
        ]);
    }
 generateTickLabels(ticks) {
        const tickOpts = this.options.ticks;
        let i, ilen, tick;
        for(i = 0, ilen = ticks.length; i < ilen; i++){
            tick = ticks[i];
            tick.label = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(tickOpts.callback, [
                tick.value,
                i,
                ticks
            ], this);
        }
    }
    afterTickToLabelConversion() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.afterTickToLabelConversion, [
            this
        ]);
    }
    beforeCalculateLabelRotation() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.beforeCalculateLabelRotation, [
            this
        ]);
    }
    calculateLabelRotation() {
        const options = this.options;
        const tickOpts = options.ticks;
        const numTicks = getTicksLimit(this.ticks.length, options.ticks.maxTicksLimit);
        const minRotation = tickOpts.minRotation || 0;
        const maxRotation = tickOpts.maxRotation;
        let labelRotation = minRotation;
        let tickWidth, maxHeight, maxLabelDiagonal;
        if (!this._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !this.isHorizontal()) {
            this.labelRotation = minRotation;
            return;
        }
        const labelSizes = this._getLabelSizes();
        const maxLabelWidth = labelSizes.widest.width;
        const maxLabelHeight = labelSizes.highest.height;
        const maxWidth = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(this.chart.width - maxLabelWidth, 0, this.maxWidth);
        tickWidth = options.offset ? this.maxWidth / numTicks : maxWidth / (numTicks - 1);
        if (maxLabelWidth + 6 > tickWidth) {
            tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1));
            maxHeight = this.maxHeight - getTickMarkLength(options.grid) - tickOpts.padding - getTitleHeight(options.title, this.chart.options.font);
            maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
            labelRotation = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.U)(Math.min(Math.asin((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)((labelSizes.highest.height + 6) / tickWidth, -1, 1)), Math.asin((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(maxHeight / maxLabelDiagonal, -1, 1)) - Math.asin((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(maxLabelHeight / maxLabelDiagonal, -1, 1))));
            labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
        }
        this.labelRotation = labelRotation;
    }
    afterCalculateLabelRotation() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.afterCalculateLabelRotation, [
            this
        ]);
    }
    afterAutoSkip() {}
    beforeFit() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.beforeFit, [
            this
        ]);
    }
    fit() {
        const minSize = {
            width: 0,
            height: 0
        };
        const { chart , options: { ticks: tickOpts , title: titleOpts , grid: gridOpts  }  } = this;
        const display = this._isVisible();
        const isHorizontal = this.isHorizontal();
        if (display) {
            const titleHeight = getTitleHeight(titleOpts, chart.options.font);
            if (isHorizontal) {
                minSize.width = this.maxWidth;
                minSize.height = getTickMarkLength(gridOpts) + titleHeight;
            } else {
                minSize.height = this.maxHeight;
                minSize.width = getTickMarkLength(gridOpts) + titleHeight;
            }
            if (tickOpts.display && this.ticks.length) {
                const { first , last , widest , highest  } = this._getLabelSizes();
                const tickPadding = tickOpts.padding * 2;
                const angleRadians = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.labelRotation);
                const cos = Math.cos(angleRadians);
                const sin = Math.sin(angleRadians);
                if (isHorizontal) {
                    const labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height;
                    minSize.height = Math.min(this.maxHeight, minSize.height + labelHeight + tickPadding);
                } else {
                    const labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height;
                    minSize.width = Math.min(this.maxWidth, minSize.width + labelWidth + tickPadding);
                }
                this._calculatePadding(first, last, sin, cos);
            }
        }
        this._handleMargins();
        if (isHorizontal) {
            this.width = this._length = chart.width - this._margins.left - this._margins.right;
            this.height = minSize.height;
        } else {
            this.width = minSize.width;
            this.height = this._length = chart.height - this._margins.top - this._margins.bottom;
        }
    }
    _calculatePadding(first, last, sin, cos) {
        const { ticks: { align , padding  } , position  } = this.options;
        const isRotated = this.labelRotation !== 0;
        const labelsBelowTicks = position !== 'top' && this.axis === 'x';
        if (this.isHorizontal()) {
            const offsetLeft = this.getPixelForTick(0) - this.left;
            const offsetRight = this.right - this.getPixelForTick(this.ticks.length - 1);
            let paddingLeft = 0;
            let paddingRight = 0;
            if (isRotated) {
                if (labelsBelowTicks) {
                    paddingLeft = cos * first.width;
                    paddingRight = sin * last.height;
                } else {
                    paddingLeft = sin * first.height;
                    paddingRight = cos * last.width;
                }
            } else if (align === 'start') {
                paddingRight = last.width;
            } else if (align === 'end') {
                paddingLeft = first.width;
            } else if (align !== 'inner') {
                paddingLeft = first.width / 2;
                paddingRight = last.width / 2;
            }
            this.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * this.width / (this.width - offsetLeft), 0);
            this.paddingRight = Math.max((paddingRight - offsetRight + padding) * this.width / (this.width - offsetRight), 0);
        } else {
            let paddingTop = last.height / 2;
            let paddingBottom = first.height / 2;
            if (align === 'start') {
                paddingTop = 0;
                paddingBottom = first.height;
            } else if (align === 'end') {
                paddingTop = last.height;
                paddingBottom = 0;
            }
            this.paddingTop = paddingTop + padding;
            this.paddingBottom = paddingBottom + padding;
        }
    }
 _handleMargins() {
        if (this._margins) {
            this._margins.left = Math.max(this.paddingLeft, this._margins.left);
            this._margins.top = Math.max(this.paddingTop, this._margins.top);
            this._margins.right = Math.max(this.paddingRight, this._margins.right);
            this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom);
        }
    }
    afterFit() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.afterFit, [
            this
        ]);
    }
 isHorizontal() {
        const { axis , position  } = this.options;
        return position === 'top' || position === 'bottom' || axis === 'x';
    }
 isFullSize() {
        return this.options.fullSize;
    }
 _convertTicksToLabels(ticks) {
        this.beforeTickToLabelConversion();
        this.generateTickLabels(ticks);
        let i, ilen;
        for(i = 0, ilen = ticks.length; i < ilen; i++){
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(ticks[i].label)) {
                ticks.splice(i, 1);
                ilen--;
                i--;
            }
        }
        this.afterTickToLabelConversion();
    }
 _getLabelSizes() {
        let labelSizes = this._labelSizes;
        if (!labelSizes) {
            const sampleSize = this.options.ticks.sampleSize;
            let ticks = this.ticks;
            if (sampleSize < ticks.length) {
                ticks = sample(ticks, sampleSize);
            }
            this._labelSizes = labelSizes = this._computeLabelSizes(ticks, ticks.length, this.options.ticks.maxTicksLimit);
        }
        return labelSizes;
    }
 _computeLabelSizes(ticks, length, maxTicksLimit) {
        const { ctx , _longestTextCache: caches  } = this;
        const widths = [];
        const heights = [];
        const increment = Math.floor(length / getTicksLimit(length, maxTicksLimit));
        let widestLabelSize = 0;
        let highestLabelSize = 0;
        let i, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel;
        for(i = 0; i < length; i += increment){
            label = ticks[i].label;
            tickFont = this._resolveTickFontOptions(i);
            ctx.font = fontString = tickFont.string;
            cache = caches[fontString] = caches[fontString] || {
                data: {},
                gc: []
            };
            lineHeight = tickFont.lineHeight;
            width = height = 0;
            if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(label) && !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(label)) {
                width = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.V)(ctx, cache.data, cache.gc, width, label);
                height = lineHeight;
            } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(label)) {
                for(j = 0, jlen = label.length; j < jlen; ++j){
                    nestedLabel =  label[j];
                    if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(nestedLabel) && !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(nestedLabel)) {
                        width = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.V)(ctx, cache.data, cache.gc, width, nestedLabel);
                        height += lineHeight;
                    }
                }
            }
            widths.push(width);
            heights.push(height);
            widestLabelSize = Math.max(width, widestLabelSize);
            highestLabelSize = Math.max(height, highestLabelSize);
        }
        garbageCollect(caches, length);
        const widest = widths.indexOf(widestLabelSize);
        const highest = heights.indexOf(highestLabelSize);
        const valueAt = (idx)=>({
                width: widths[idx] || 0,
                height: heights[idx] || 0
            });
        return {
            first: valueAt(0),
            last: valueAt(length - 1),
            widest: valueAt(widest),
            highest: valueAt(highest),
            widths,
            heights
        };
    }
 getLabelForValue(value) {
        return value;
    }
 getPixelForValue(value, index) {
        return NaN;
    }
 getValueForPixel(pixel) {}
 getPixelForTick(index) {
        const ticks = this.ticks;
        if (index < 0 || index > ticks.length - 1) {
            return null;
        }
        return this.getPixelForValue(ticks[index].value);
    }
 getPixelForDecimal(decimal) {
        if (this._reversePixels) {
            decimal = 1 - decimal;
        }
        const pixel = this._startPixel + decimal * this._length;
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.W)(this._alignToPixels ? (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(this.chart, pixel, 0) : pixel);
    }
 getDecimalForPixel(pixel) {
        const decimal = (pixel - this._startPixel) / this._length;
        return this._reversePixels ? 1 - decimal : decimal;
    }
 getBasePixel() {
        return this.getPixelForValue(this.getBaseValue());
    }
 getBaseValue() {
        const { min , max  } = this;
        return min < 0 && max < 0 ? max : min > 0 && max > 0 ? min : 0;
    }
 getContext(index) {
        const ticks = this.ticks || [];
        if (index >= 0 && index < ticks.length) {
            const tick = ticks[index];
            return tick.$context || (tick.$context = createTickContext(this.getContext(), index, tick));
        }
        return this.$context || (this.$context = createScaleContext(this.chart.getContext(), this));
    }
 _tickSize() {
        const optionTicks = this.options.ticks;
        const rot = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.labelRotation);
        const cos = Math.abs(Math.cos(rot));
        const sin = Math.abs(Math.sin(rot));
        const labelSizes = this._getLabelSizes();
        const padding = optionTicks.autoSkipPadding || 0;
        const w = labelSizes ? labelSizes.widest.width + padding : 0;
        const h = labelSizes ? labelSizes.highest.height + padding : 0;
        return this.isHorizontal() ? h * cos > w * sin ? w / cos : h / sin : h * sin < w * cos ? h / cos : w / sin;
    }
 _isVisible() {
        const display = this.options.display;
        if (display !== 'auto') {
            return !!display;
        }
        return this.getMatchingVisibleMetas().length > 0;
    }
 _computeGridLineItems(chartArea) {
        const axis = this.axis;
        const chart = this.chart;
        const options = this.options;
        const { grid , position , border  } = options;
        const offset = grid.offset;
        const isHorizontal = this.isHorizontal();
        const ticks = this.ticks;
        const ticksLength = ticks.length + (offset ? 1 : 0);
        const tl = getTickMarkLength(grid);
        const items = [];
        const borderOpts = border.setContext(this.getContext());
        const axisWidth = borderOpts.display ? borderOpts.width : 0;
        const axisHalfWidth = axisWidth / 2;
        const alignBorderValue = function(pixel) {
            return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(chart, pixel, axisWidth);
        };
        let borderValue, i, lineValue, alignedLineValue;
        let tx1, ty1, tx2, ty2, x1, y1, x2, y2;
        if (position === 'top') {
            borderValue = alignBorderValue(this.bottom);
            ty1 = this.bottom - tl;
            ty2 = borderValue - axisHalfWidth;
            y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
            y2 = chartArea.bottom;
        } else if (position === 'bottom') {
            borderValue = alignBorderValue(this.top);
            y1 = chartArea.top;
            y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
            ty1 = borderValue + axisHalfWidth;
            ty2 = this.top + tl;
        } else if (position === 'left') {
            borderValue = alignBorderValue(this.right);
            tx1 = this.right - tl;
            tx2 = borderValue - axisHalfWidth;
            x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
            x2 = chartArea.right;
        } else if (position === 'right') {
            borderValue = alignBorderValue(this.left);
            x1 = chartArea.left;
            x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
            tx1 = borderValue + axisHalfWidth;
            tx2 = this.left + tl;
        } else if (axis === 'x') {
            if (position === 'center') {
                borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5);
            } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
                const positionAxisID = Object.keys(position)[0];
                const value = position[positionAxisID];
                borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
            }
            y1 = chartArea.top;
            y2 = chartArea.bottom;
            ty1 = borderValue + axisHalfWidth;
            ty2 = ty1 + tl;
        } else if (axis === 'y') {
            if (position === 'center') {
                borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2);
            } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
                const positionAxisID = Object.keys(position)[0];
                const value = position[positionAxisID];
                borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
            }
            tx1 = borderValue - axisHalfWidth;
            tx2 = tx1 - tl;
            x1 = chartArea.left;
            x2 = chartArea.right;
        }
        const limit = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(options.ticks.maxTicksLimit, ticksLength);
        const step = Math.max(1, Math.ceil(ticksLength / limit));
        for(i = 0; i < ticksLength; i += step){
            const context = this.getContext(i);
            const optsAtIndex = grid.setContext(context);
            const optsAtIndexBorder = border.setContext(context);
            const lineWidth = optsAtIndex.lineWidth;
            const lineColor = optsAtIndex.color;
            const borderDash = optsAtIndexBorder.dash || [];
            const borderDashOffset = optsAtIndexBorder.dashOffset;
            const tickWidth = optsAtIndex.tickWidth;
            const tickColor = optsAtIndex.tickColor;
            const tickBorderDash = optsAtIndex.tickBorderDash || [];
            const tickBorderDashOffset = optsAtIndex.tickBorderDashOffset;
            lineValue = getPixelForGridLine(this, i, offset);
            if (lineValue === undefined) {
                continue;
            }
            alignedLineValue = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(chart, lineValue, lineWidth);
            if (isHorizontal) {
                tx1 = tx2 = x1 = x2 = alignedLineValue;
            } else {
                ty1 = ty2 = y1 = y2 = alignedLineValue;
            }
            items.push({
                tx1,
                ty1,
                tx2,
                ty2,
                x1,
                y1,
                x2,
                y2,
                width: lineWidth,
                color: lineColor,
                borderDash,
                borderDashOffset,
                tickWidth,
                tickColor,
                tickBorderDash,
                tickBorderDashOffset
            });
        }
        this._ticksLength = ticksLength;
        this._borderValue = borderValue;
        return items;
    }
 _computeLabelItems(chartArea) {
        const axis = this.axis;
        const options = this.options;
        const { position , ticks: optionTicks  } = options;
        const isHorizontal = this.isHorizontal();
        const ticks = this.ticks;
        const { align , crossAlign , padding , mirror  } = optionTicks;
        const tl = getTickMarkLength(options.grid);
        const tickAndPadding = tl + padding;
        const hTickAndPadding = mirror ? -padding : tickAndPadding;
        const rotation = -(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.labelRotation);
        const items = [];
        let i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset;
        let textBaseline = 'middle';
        if (position === 'top') {
            y = this.bottom - hTickAndPadding;
            textAlign = this._getXAxisLabelAlignment();
        } else if (position === 'bottom') {
            y = this.top + hTickAndPadding;
            textAlign = this._getXAxisLabelAlignment();
        } else if (position === 'left') {
            const ret = this._getYAxisLabelAlignment(tl);
            textAlign = ret.textAlign;
            x = ret.x;
        } else if (position === 'right') {
            const ret = this._getYAxisLabelAlignment(tl);
            textAlign = ret.textAlign;
            x = ret.x;
        } else if (axis === 'x') {
            if (position === 'center') {
                y = (chartArea.top + chartArea.bottom) / 2 + tickAndPadding;
            } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
                const positionAxisID = Object.keys(position)[0];
                const value = position[positionAxisID];
                y = this.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
            }
            textAlign = this._getXAxisLabelAlignment();
        } else if (axis === 'y') {
            if (position === 'center') {
                x = (chartArea.left + chartArea.right) / 2 - tickAndPadding;
            } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
                const positionAxisID = Object.keys(position)[0];
                const value = position[positionAxisID];
                x = this.chart.scales[positionAxisID].getPixelForValue(value);
            }
            textAlign = this._getYAxisLabelAlignment(tl).textAlign;
        }
        if (axis === 'y') {
            if (align === 'start') {
                textBaseline = 'top';
            } else if (align === 'end') {
                textBaseline = 'bottom';
            }
        }
        const labelSizes = this._getLabelSizes();
        for(i = 0, ilen = ticks.length; i < ilen; ++i){
            tick = ticks[i];
            label = tick.label;
            const optsAtIndex = optionTicks.setContext(this.getContext(i));
            pixel = this.getPixelForTick(i) + optionTicks.labelOffset;
            font = this._resolveTickFontOptions(i);
            lineHeight = font.lineHeight;
            lineCount = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(label) ? label.length : 1;
            const halfCount = lineCount / 2;
            const color = optsAtIndex.color;
            const strokeColor = optsAtIndex.textStrokeColor;
            const strokeWidth = optsAtIndex.textStrokeWidth;
            let tickTextAlign = textAlign;
            if (isHorizontal) {
                x = pixel;
                if (textAlign === 'inner') {
                    if (i === ilen - 1) {
                        tickTextAlign = !this.options.reverse ? 'right' : 'left';
                    } else if (i === 0) {
                        tickTextAlign = !this.options.reverse ? 'left' : 'right';
                    } else {
                        tickTextAlign = 'center';
                    }
                }
                if (position === 'top') {
                    if (crossAlign === 'near' || rotation !== 0) {
                        textOffset = -lineCount * lineHeight + lineHeight / 2;
                    } else if (crossAlign === 'center') {
                        textOffset = -labelSizes.highest.height / 2 - halfCount * lineHeight + lineHeight;
                    } else {
                        textOffset = -labelSizes.highest.height + lineHeight / 2;
                    }
                } else {
                    if (crossAlign === 'near' || rotation !== 0) {
                        textOffset = lineHeight / 2;
                    } else if (crossAlign === 'center') {
                        textOffset = labelSizes.highest.height / 2 - halfCount * lineHeight;
                    } else {
                        textOffset = labelSizes.highest.height - lineCount * lineHeight;
                    }
                }
                if (mirror) {
                    textOffset *= -1;
                }
                if (rotation !== 0 && !optsAtIndex.showLabelBackdrop) {
                    x += lineHeight / 2 * Math.sin(rotation);
                }
            } else {
                y = pixel;
                textOffset = (1 - lineCount) * lineHeight / 2;
            }
            let backdrop;
            if (optsAtIndex.showLabelBackdrop) {
                const labelPadding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(optsAtIndex.backdropPadding);
                const height = labelSizes.heights[i];
                const width = labelSizes.widths[i];
                let top = textOffset - labelPadding.top;
                let left = 0 - labelPadding.left;
                switch(textBaseline){
                    case 'middle':
                        top -= height / 2;
                        break;
                    case 'bottom':
                        top -= height;
                        break;
                }
                switch(textAlign){
                    case 'center':
                        left -= width / 2;
                        break;
                    case 'right':
                        left -= width;
                        break;
                    case 'inner':
                        if (i === ilen - 1) {
                            left -= width;
                        } else if (i > 0) {
                            left -= width / 2;
                        }
                        break;
                }
                backdrop = {
                    left,
                    top,
                    width: width + labelPadding.width,
                    height: height + labelPadding.height,
                    color: optsAtIndex.backdropColor
                };
            }
            items.push({
                label,
                font,
                textOffset,
                options: {
                    rotation,
                    color,
                    strokeColor,
                    strokeWidth,
                    textAlign: tickTextAlign,
                    textBaseline,
                    translation: [
                        x,
                        y
                    ],
                    backdrop
                }
            });
        }
        return items;
    }
    _getXAxisLabelAlignment() {
        const { position , ticks  } = this.options;
        const rotation = -(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.labelRotation);
        if (rotation) {
            return position === 'top' ? 'left' : 'right';
        }
        let align = 'center';
        if (ticks.align === 'start') {
            align = 'left';
        } else if (ticks.align === 'end') {
            align = 'right';
        } else if (ticks.align === 'inner') {
            align = 'inner';
        }
        return align;
    }
    _getYAxisLabelAlignment(tl) {
        const { position , ticks: { crossAlign , mirror , padding  }  } = this.options;
        const labelSizes = this._getLabelSizes();
        const tickAndPadding = tl + padding;
        const widest = labelSizes.widest.width;
        let textAlign;
        let x;
        if (position === 'left') {
            if (mirror) {
                x = this.right + padding;
                if (crossAlign === 'near') {
                    textAlign = 'left';
                } else if (crossAlign === 'center') {
                    textAlign = 'center';
                    x += widest / 2;
                } else {
                    textAlign = 'right';
                    x += widest;
                }
            } else {
                x = this.right - tickAndPadding;
                if (crossAlign === 'near') {
                    textAlign = 'right';
                } else if (crossAlign === 'center') {
                    textAlign = 'center';
                    x -= widest / 2;
                } else {
                    textAlign = 'left';
                    x = this.left;
                }
            }
        } else if (position === 'right') {
            if (mirror) {
                x = this.left + padding;
                if (crossAlign === 'near') {
                    textAlign = 'right';
                } else if (crossAlign === 'center') {
                    textAlign = 'center';
                    x -= widest / 2;
                } else {
                    textAlign = 'left';
                    x -= widest;
                }
            } else {
                x = this.left + tickAndPadding;
                if (crossAlign === 'near') {
                    textAlign = 'left';
                } else if (crossAlign === 'center') {
                    textAlign = 'center';
                    x += widest / 2;
                } else {
                    textAlign = 'right';
                    x = this.right;
                }
            }
        } else {
            textAlign = 'right';
        }
        return {
            textAlign,
            x
        };
    }
 _computeLabelArea() {
        if (this.options.ticks.mirror) {
            return;
        }
        const chart = this.chart;
        const position = this.options.position;
        if (position === 'left' || position === 'right') {
            return {
                top: 0,
                left: this.left,
                bottom: chart.height,
                right: this.right
            };
        }
        if (position === 'top' || position === 'bottom') {
            return {
                top: this.top,
                left: 0,
                bottom: this.bottom,
                right: chart.width
            };
        }
    }
 drawBackground() {
        const { ctx , options: { backgroundColor  } , left , top , width , height  } = this;
        if (backgroundColor) {
            ctx.save();
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(left, top, width, height);
            ctx.restore();
        }
    }
    getLineWidthForValue(value) {
        const grid = this.options.grid;
        if (!this._isVisible() || !grid.display) {
            return 0;
        }
        const ticks = this.ticks;
        const index = ticks.findIndex((t)=>t.value === value);
        if (index >= 0) {
            const opts = grid.setContext(this.getContext(index));
            return opts.lineWidth;
        }
        return 0;
    }
 drawGrid(chartArea) {
        const grid = this.options.grid;
        const ctx = this.ctx;
        const items = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(chartArea));
        let i, ilen;
        const drawLine = (p1, p2, style)=>{
            if (!style.width || !style.color) {
                return;
            }
            ctx.save();
            ctx.lineWidth = style.width;
            ctx.strokeStyle = style.color;
            ctx.setLineDash(style.borderDash || []);
            ctx.lineDashOffset = style.borderDashOffset;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
        };
        if (grid.display) {
            for(i = 0, ilen = items.length; i < ilen; ++i){
                const item = items[i];
                if (grid.drawOnChartArea) {
                    drawLine({
                        x: item.x1,
                        y: item.y1
                    }, {
                        x: item.x2,
                        y: item.y2
                    }, item);
                }
                if (grid.drawTicks) {
                    drawLine({
                        x: item.tx1,
                        y: item.ty1
                    }, {
                        x: item.tx2,
                        y: item.ty2
                    }, {
                        color: item.tickColor,
                        width: item.tickWidth,
                        borderDash: item.tickBorderDash,
                        borderDashOffset: item.tickBorderDashOffset
                    });
                }
            }
        }
    }
 drawBorder() {
        const { chart , ctx , options: { border , grid  }  } = this;
        const borderOpts = border.setContext(this.getContext());
        const axisWidth = border.display ? borderOpts.width : 0;
        if (!axisWidth) {
            return;
        }
        const lastLineWidth = grid.setContext(this.getContext(0)).lineWidth;
        const borderValue = this._borderValue;
        let x1, x2, y1, y2;
        if (this.isHorizontal()) {
            x1 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(chart, this.left, axisWidth) - axisWidth / 2;
            x2 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(chart, this.right, lastLineWidth) + lastLineWidth / 2;
            y1 = y2 = borderValue;
        } else {
            y1 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(chart, this.top, axisWidth) - axisWidth / 2;
            y2 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(chart, this.bottom, lastLineWidth) + lastLineWidth / 2;
            x1 = x2 = borderValue;
        }
        ctx.save();
        ctx.lineWidth = borderOpts.width;
        ctx.strokeStyle = borderOpts.color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }
 drawLabels(chartArea) {
        const optionTicks = this.options.ticks;
        if (!optionTicks.display) {
            return;
        }
        const ctx = this.ctx;
        const area = this._computeLabelArea();
        if (area) {
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Y)(ctx, area);
        }
        const items = this.getLabelItems(chartArea);
        for (const item of items){
            const renderTextOptions = item.options;
            const tickFont = item.font;
            const label = item.label;
            const y = item.textOffset;
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, label, 0, y, tickFont, renderTextOptions);
        }
        if (area) {
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.$)(ctx);
        }
    }
 drawTitle() {
        const { ctx , options: { position , title , reverse  }  } = this;
        if (!title.display) {
            return;
        }
        const font = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(title.font);
        const padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(title.padding);
        const align = title.align;
        let offset = font.lineHeight / 2;
        if (position === 'bottom' || position === 'center' || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
            offset += padding.bottom;
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(title.text)) {
                offset += font.lineHeight * (title.text.length - 1);
            }
        } else {
            offset += padding.top;
        }
        const { titleX , titleY , maxWidth , rotation  } = titleArgs(this, offset, position, align);
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, title.text, 0, 0, font, {
            color: title.color,
            maxWidth,
            rotation,
            textAlign: titleAlign(align, position, reverse),
            textBaseline: 'middle',
            translation: [
                titleX,
                titleY
            ]
        });
    }
    draw(chartArea) {
        if (!this._isVisible()) {
            return;
        }
        this.drawBackground();
        this.drawGrid(chartArea);
        this.drawBorder();
        this.drawTitle();
        this.drawLabels(chartArea);
    }
 _layers() {
        const opts = this.options;
        const tz = opts.ticks && opts.ticks.z || 0;
        const gz = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(opts.grid && opts.grid.z, -1);
        const bz = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(opts.border && opts.border.z, 0);
        if (!this._isVisible() || this.draw !== Scale.prototype.draw) {
            return [
                {
                    z: tz,
                    draw: (chartArea)=>{
                        this.draw(chartArea);
                    }
                }
            ];
        }
        return [
            {
                z: gz,
                draw: (chartArea)=>{
                    this.drawBackground();
                    this.drawGrid(chartArea);
                    this.drawTitle();
                }
            },
            {
                z: bz,
                draw: ()=>{
                    this.drawBorder();
                }
            },
            {
                z: tz,
                draw: (chartArea)=>{
                    this.drawLabels(chartArea);
                }
            }
        ];
    }
 getMatchingVisibleMetas(type) {
        const metas = this.chart.getSortedVisibleDatasetMetas();
        const axisID = this.axis + 'AxisID';
        const result = [];
        let i, ilen;
        for(i = 0, ilen = metas.length; i < ilen; ++i){
            const meta = metas[i];
            if (meta[axisID] === this.id && (!type || meta.type === type)) {
                result.push(meta);
            }
        }
        return result;
    }
 _resolveTickFontOptions(index) {
        const opts = this.options.ticks.setContext(this.getContext(index));
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(opts.font);
    }
 _maxDigits() {
        const fontSize = this._resolveTickFontOptions(0).lineHeight;
        return (this.isHorizontal() ? this.width : this.height) / fontSize;
    }
}

class TypedRegistry {
    constructor(type, scope, override){
        this.type = type;
        this.scope = scope;
        this.override = override;
        this.items = Object.create(null);
    }
    isForType(type) {
        return Object.prototype.isPrototypeOf.call(this.type.prototype, type.prototype);
    }
 register(item) {
        const proto = Object.getPrototypeOf(item);
        let parentScope;
        if (isIChartComponent(proto)) {
            parentScope = this.register(proto);
        }
        const items = this.items;
        const id = item.id;
        const scope = this.scope + '.' + id;
        if (!id) {
            throw new Error('class does not have id: ' + item);
        }
        if (id in items) {
            return scope;
        }
        items[id] = item;
        registerDefaults(item, scope, parentScope);
        if (this.override) {
            _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.override(item.id, item.overrides);
        }
        return scope;
    }
 get(id) {
        return this.items[id];
    }
 unregister(item) {
        const items = this.items;
        const id = item.id;
        const scope = this.scope;
        if (id in items) {
            delete items[id];
        }
        if (scope && id in _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d[scope]) {
            delete _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d[scope][id];
            if (this.override) {
                delete _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a3[id];
            }
        }
    }
}
function registerDefaults(item, scope, parentScope) {
    const itemDefaults = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a4)(Object.create(null), [
        parentScope ? _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.get(parentScope) : {},
        _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.get(scope),
        item.defaults
    ]);
    _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.set(scope, itemDefaults);
    if (item.defaultRoutes) {
        routeDefaults(scope, item.defaultRoutes);
    }
    if (item.descriptors) {
        _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.describe(scope, item.descriptors);
    }
}
function routeDefaults(scope, routes) {
    Object.keys(routes).forEach((property)=>{
        const propertyParts = property.split('.');
        const sourceName = propertyParts.pop();
        const sourceScope = [
            scope
        ].concat(propertyParts).join('.');
        const parts = routes[property].split('.');
        const targetName = parts.pop();
        const targetScope = parts.join('.');
        _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.route(sourceScope, sourceName, targetScope, targetName);
    });
}
function isIChartComponent(proto) {
    return 'id' in proto && 'defaults' in proto;
}

class Registry {
    constructor(){
        this.controllers = new TypedRegistry(DatasetController, 'datasets', true);
        this.elements = new TypedRegistry(Element, 'elements');
        this.plugins = new TypedRegistry(Object, 'plugins');
        this.scales = new TypedRegistry(Scale, 'scales');
        this._typedRegistries = [
            this.controllers,
            this.scales,
            this.elements
        ];
    }
 add(...args) {
        this._each('register', args);
    }
    remove(...args) {
        this._each('unregister', args);
    }
 addControllers(...args) {
        this._each('register', args, this.controllers);
    }
 addElements(...args) {
        this._each('register', args, this.elements);
    }
 addPlugins(...args) {
        this._each('register', args, this.plugins);
    }
 addScales(...args) {
        this._each('register', args, this.scales);
    }
 getController(id) {
        return this._get(id, this.controllers, 'controller');
    }
 getElement(id) {
        return this._get(id, this.elements, 'element');
    }
 getPlugin(id) {
        return this._get(id, this.plugins, 'plugin');
    }
 getScale(id) {
        return this._get(id, this.scales, 'scale');
    }
 removeControllers(...args) {
        this._each('unregister', args, this.controllers);
    }
 removeElements(...args) {
        this._each('unregister', args, this.elements);
    }
 removePlugins(...args) {
        this._each('unregister', args, this.plugins);
    }
 removeScales(...args) {
        this._each('unregister', args, this.scales);
    }
 _each(method, args, typedRegistry) {
        [
            ...args
        ].forEach((arg)=>{
            const reg = typedRegistry || this._getRegistryForType(arg);
            if (typedRegistry || reg.isForType(arg) || reg === this.plugins && arg.id) {
                this._exec(method, reg, arg);
            } else {
                (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(arg, (item)=>{
                    const itemReg = typedRegistry || this._getRegistryForType(item);
                    this._exec(method, itemReg, item);
                });
            }
        });
    }
 _exec(method, registry, component) {
        const camelMethod = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a5)(method);
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(component['before' + camelMethod], [], component);
        registry[method](component);
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(component['after' + camelMethod], [], component);
    }
 _getRegistryForType(type) {
        for(let i = 0; i < this._typedRegistries.length; i++){
            const reg = this._typedRegistries[i];
            if (reg.isForType(type)) {
                return reg;
            }
        }
        return this.plugins;
    }
 _get(id, typedRegistry, type) {
        const item = typedRegistry.get(id);
        if (item === undefined) {
            throw new Error('"' + id + '" is not a registered ' + type + '.');
        }
        return item;
    }
}
var registry = /* #__PURE__ */ new Registry();

class PluginService {
    constructor(){
        this._init = [];
    }
 notify(chart, hook, args, filter) {
        if (hook === 'beforeInit') {
            this._init = this._createDescriptors(chart, true);
            this._notify(this._init, chart, 'install');
        }
        const descriptors = filter ? this._descriptors(chart).filter(filter) : this._descriptors(chart);
        const result = this._notify(descriptors, chart, hook, args);
        if (hook === 'afterDestroy') {
            this._notify(descriptors, chart, 'stop');
            this._notify(this._init, chart, 'uninstall');
        }
        return result;
    }
 _notify(descriptors, chart, hook, args) {
        args = args || {};
        for (const descriptor of descriptors){
            const plugin = descriptor.plugin;
            const method = plugin[hook];
            const params = [
                chart,
                args,
                descriptor.options
            ];
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(method, params, plugin) === false && args.cancelable) {
                return false;
            }
        }
        return true;
    }
    invalidate() {
        if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(this._cache)) {
            this._oldCache = this._cache;
            this._cache = undefined;
        }
    }
 _descriptors(chart) {
        if (this._cache) {
            return this._cache;
        }
        const descriptors = this._cache = this._createDescriptors(chart);
        this._notifyStateChanges(chart);
        return descriptors;
    }
    _createDescriptors(chart, all) {
        const config = chart && chart.config;
        const options = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(config.options && config.options.plugins, {});
        const plugins = allPlugins(config);
        return options === false && !all ? [] : createDescriptors(chart, plugins, options, all);
    }
 _notifyStateChanges(chart) {
        const previousDescriptors = this._oldCache || [];
        const descriptors = this._cache;
        const diff = (a, b)=>a.filter((x)=>!b.some((y)=>x.plugin.id === y.plugin.id));
        this._notify(diff(previousDescriptors, descriptors), chart, 'stop');
        this._notify(diff(descriptors, previousDescriptors), chart, 'start');
    }
}
 function allPlugins(config) {
    const localIds = {};
    const plugins = [];
    const keys = Object.keys(registry.plugins.items);
    for(let i = 0; i < keys.length; i++){
        plugins.push(registry.getPlugin(keys[i]));
    }
    const local = config.plugins || [];
    for(let i = 0; i < local.length; i++){
        const plugin = local[i];
        if (plugins.indexOf(plugin) === -1) {
            plugins.push(plugin);
            localIds[plugin.id] = true;
        }
    }
    return {
        plugins,
        localIds
    };
}
function getOpts(options, all) {
    if (!all && options === false) {
        return null;
    }
    if (options === true) {
        return {};
    }
    return options;
}
function createDescriptors(chart, { plugins , localIds  }, options, all) {
    const result = [];
    const context = chart.getContext();
    for (const plugin of plugins){
        const id = plugin.id;
        const opts = getOpts(options[id], all);
        if (opts === null) {
            continue;
        }
        result.push({
            plugin,
            options: pluginOpts(chart.config, {
                plugin,
                local: localIds[id]
            }, opts, context)
        });
    }
    return result;
}
function pluginOpts(config, { plugin , local  }, opts, context) {
    const keys = config.pluginScopeKeys(plugin);
    const scopes = config.getOptionScopes(opts, keys);
    if (local && plugin.defaults) {
        scopes.push(plugin.defaults);
    }
    return config.createResolver(scopes, context, [
        ''
    ], {
        scriptable: false,
        indexable: false,
        allKeys: true
    });
}

function getIndexAxis(type, options) {
    const datasetDefaults = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.datasets[type] || {};
    const datasetOptions = (options.datasets || {})[type] || {};
    return datasetOptions.indexAxis || options.indexAxis || datasetDefaults.indexAxis || 'x';
}
function getAxisFromDefaultScaleID(id, indexAxis) {
    let axis = id;
    if (id === '_index_') {
        axis = indexAxis;
    } else if (id === '_value_') {
        axis = indexAxis === 'x' ? 'y' : 'x';
    }
    return axis;
}
function getDefaultScaleIDFromAxis(axis, indexAxis) {
    return axis === indexAxis ? '_index_' : '_value_';
}
function idMatchesAxis(id) {
    if (id === 'x' || id === 'y' || id === 'r') {
        return id;
    }
}
function axisFromPosition(position) {
    if (position === 'top' || position === 'bottom') {
        return 'x';
    }
    if (position === 'left' || position === 'right') {
        return 'y';
    }
}
function determineAxis(id, ...scaleOptions) {
    if (idMatchesAxis(id)) {
        return id;
    }
    for (const opts of scaleOptions){
        const axis = opts.axis || axisFromPosition(opts.position) || id.length > 1 && idMatchesAxis(id[0].toLowerCase());
        if (axis) {
            return axis;
        }
    }
    throw new Error(`Cannot determine type of '${id}' axis. Please provide 'axis' or 'position' option.`);
}
function getAxisFromDataset(id, axis, dataset) {
    if (dataset[axis + 'AxisID'] === id) {
        return {
            axis
        };
    }
}
function retrieveAxisFromDatasets(id, config) {
    if (config.data && config.data.datasets) {
        const boundDs = config.data.datasets.filter((d)=>d.xAxisID === id || d.yAxisID === id);
        if (boundDs.length) {
            return getAxisFromDataset(id, 'x', boundDs[0]) || getAxisFromDataset(id, 'y', boundDs[0]);
        }
    }
    return {};
}
function mergeScaleConfig(config, options) {
    const chartDefaults = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a3[config.type] || {
        scales: {}
    };
    const configScales = options.scales || {};
    const chartIndexAxis = getIndexAxis(config.type, options);
    const scales = Object.create(null);
    Object.keys(configScales).forEach((id)=>{
        const scaleConf = configScales[id];
        if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(scaleConf)) {
            return console.error(`Invalid scale configuration for scale: ${id}`);
        }
        if (scaleConf._proxy) {
            return console.warn(`Ignoring resolver passed as options for scale: ${id}`);
        }
        const axis = determineAxis(id, scaleConf, retrieveAxisFromDatasets(id, config), _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.scales[scaleConf.type]);
        const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
        const defaultScaleOptions = chartDefaults.scales || {};
        scales[id] = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ab)(Object.create(null), [
            {
                axis
            },
            scaleConf,
            defaultScaleOptions[axis],
            defaultScaleOptions[defaultId]
        ]);
    });
    config.data.datasets.forEach((dataset)=>{
        const type = dataset.type || config.type;
        const indexAxis = dataset.indexAxis || getIndexAxis(type, options);
        const datasetDefaults = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a3[type] || {};
        const defaultScaleOptions = datasetDefaults.scales || {};
        Object.keys(defaultScaleOptions).forEach((defaultID)=>{
            const axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
            const id = dataset[axis + 'AxisID'] || axis;
            scales[id] = scales[id] || Object.create(null);
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ab)(scales[id], [
                {
                    axis
                },
                configScales[id],
                defaultScaleOptions[defaultID]
            ]);
        });
    });
    Object.keys(scales).forEach((key)=>{
        const scale = scales[key];
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ab)(scale, [
            _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.scales[scale.type],
            _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.scale
        ]);
    });
    return scales;
}
function initOptions(config) {
    const options = config.options || (config.options = {});
    options.plugins = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(options.plugins, {});
    options.scales = mergeScaleConfig(config, options);
}
function initData(data) {
    data = data || {};
    data.datasets = data.datasets || [];
    data.labels = data.labels || [];
    return data;
}
function initConfig(config) {
    config = config || {};
    config.data = initData(config.data);
    initOptions(config);
    return config;
}
const keyCache = new Map();
const keysCached = new Set();
function cachedKeys(cacheKey, generate) {
    let keys = keyCache.get(cacheKey);
    if (!keys) {
        keys = generate();
        keyCache.set(cacheKey, keys);
        keysCached.add(keys);
    }
    return keys;
}
const addIfFound = (set, obj, key)=>{
    const opts = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f)(obj, key);
    if (opts !== undefined) {
        set.add(opts);
    }
};
class Config {
    constructor(config){
        this._config = initConfig(config);
        this._scopeCache = new Map();
        this._resolverCache = new Map();
    }
    get platform() {
        return this._config.platform;
    }
    get type() {
        return this._config.type;
    }
    set type(type) {
        this._config.type = type;
    }
    get data() {
        return this._config.data;
    }
    set data(data) {
        this._config.data = initData(data);
    }
    get options() {
        return this._config.options;
    }
    set options(options) {
        this._config.options = options;
    }
    get plugins() {
        return this._config.plugins;
    }
    update() {
        const config = this._config;
        this.clearCache();
        initOptions(config);
    }
    clearCache() {
        this._scopeCache.clear();
        this._resolverCache.clear();
    }
 datasetScopeKeys(datasetType) {
        return cachedKeys(datasetType, ()=>[
                [
                    `datasets.${datasetType}`,
                    ''
                ]
            ]);
    }
 datasetAnimationScopeKeys(datasetType, transition) {
        return cachedKeys(`${datasetType}.transition.${transition}`, ()=>[
                [
                    `datasets.${datasetType}.transitions.${transition}`,
                    `transitions.${transition}`
                ],
                [
                    `datasets.${datasetType}`,
                    ''
                ]
            ]);
    }
 datasetElementScopeKeys(datasetType, elementType) {
        return cachedKeys(`${datasetType}-${elementType}`, ()=>[
                [
                    `datasets.${datasetType}.elements.${elementType}`,
                    `datasets.${datasetType}`,
                    `elements.${elementType}`,
                    ''
                ]
            ]);
    }
 pluginScopeKeys(plugin) {
        const id = plugin.id;
        const type = this.type;
        return cachedKeys(`${type}-plugin-${id}`, ()=>[
                [
                    `plugins.${id}`,
                    ...plugin.additionalOptionScopes || []
                ]
            ]);
    }
 _cachedScopes(mainScope, resetCache) {
        const _scopeCache = this._scopeCache;
        let cache = _scopeCache.get(mainScope);
        if (!cache || resetCache) {
            cache = new Map();
            _scopeCache.set(mainScope, cache);
        }
        return cache;
    }
 getOptionScopes(mainScope, keyLists, resetCache) {
        const { options , type  } = this;
        const cache = this._cachedScopes(mainScope, resetCache);
        const cached = cache.get(keyLists);
        if (cached) {
            return cached;
        }
        const scopes = new Set();
        keyLists.forEach((keys)=>{
            if (mainScope) {
                scopes.add(mainScope);
                keys.forEach((key)=>addIfFound(scopes, mainScope, key));
            }
            keys.forEach((key)=>addIfFound(scopes, options, key));
            keys.forEach((key)=>addIfFound(scopes, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a3[type] || {}, key));
            keys.forEach((key)=>addIfFound(scopes, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d, key));
            keys.forEach((key)=>addIfFound(scopes, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a6, key));
        });
        const array = Array.from(scopes);
        if (array.length === 0) {
            array.push(Object.create(null));
        }
        if (keysCached.has(keyLists)) {
            cache.set(keyLists, array);
        }
        return array;
    }
 chartOptionScopes() {
        const { options , type  } = this;
        return [
            options,
            _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a3[type] || {},
            _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.datasets[type] || {},
            {
                type
            },
            _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d,
            _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a6
        ];
    }
 resolveNamedOptions(scopes, names, context, prefixes = [
        ''
    ]) {
        const result = {
            $shared: true
        };
        const { resolver , subPrefixes  } = getResolver(this._resolverCache, scopes, prefixes);
        let options = resolver;
        if (needContext(resolver, names)) {
            result.$shared = false;
            context = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a7)(context) ? context() : context;
            const subResolver = this.createResolver(scopes, context, subPrefixes);
            options = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a8)(resolver, context, subResolver);
        }
        for (const prop of names){
            result[prop] = options[prop];
        }
        return result;
    }
 createResolver(scopes, context, prefixes = [
        ''
    ], descriptorDefaults) {
        const { resolver  } = getResolver(this._resolverCache, scopes, prefixes);
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(context) ? (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a8)(resolver, context, undefined, descriptorDefaults) : resolver;
    }
}
function getResolver(resolverCache, scopes, prefixes) {
    let cache = resolverCache.get(scopes);
    if (!cache) {
        cache = new Map();
        resolverCache.set(scopes, cache);
    }
    const cacheKey = prefixes.join();
    let cached = cache.get(cacheKey);
    if (!cached) {
        const resolver = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a9)(scopes, prefixes);
        cached = {
            resolver,
            subPrefixes: prefixes.filter((p)=>!p.toLowerCase().includes('hover'))
        };
        cache.set(cacheKey, cached);
    }
    return cached;
}
const hasFunction = (value)=>(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(value) && Object.getOwnPropertyNames(value).some((key)=>(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a7)(value[key]));
function needContext(proxy, names) {
    const { isScriptable , isIndexable  } = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aa)(proxy);
    for (const prop of names){
        const scriptable = isScriptable(prop);
        const indexable = isIndexable(prop);
        const value = (indexable || scriptable) && proxy[prop];
        if (scriptable && ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a7)(value) || hasFunction(value)) || indexable && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(value)) {
            return true;
        }
    }
    return false;
}

var version = "4.4.1";

const KNOWN_POSITIONS = [
    'top',
    'bottom',
    'left',
    'right',
    'chartArea'
];
function positionIsHorizontal(position, axis) {
    return position === 'top' || position === 'bottom' || KNOWN_POSITIONS.indexOf(position) === -1 && axis === 'x';
}
function compare2Level(l1, l2) {
    return function(a, b) {
        return a[l1] === b[l1] ? a[l2] - b[l2] : a[l1] - b[l1];
    };
}
function onAnimationsComplete(context) {
    const chart = context.chart;
    const animationOptions = chart.options.animation;
    chart.notifyPlugins('afterRender');
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(animationOptions && animationOptions.onComplete, [
        context
    ], chart);
}
function onAnimationProgress(context) {
    const chart = context.chart;
    const animationOptions = chart.options.animation;
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(animationOptions && animationOptions.onProgress, [
        context
    ], chart);
}
 function getCanvas(item) {
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.M)() && typeof item === 'string') {
        item = document.getElementById(item);
    } else if (item && item.length) {
        item = item[0];
    }
    if (item && item.canvas) {
        item = item.canvas;
    }
    return item;
}
const instances = {};
const getChart = (key)=>{
    const canvas = getCanvas(key);
    return Object.values(instances).filter((c)=>c.canvas === canvas).pop();
};
function moveNumericKeys(obj, start, move) {
    const keys = Object.keys(obj);
    for (const key of keys){
        const intKey = +key;
        if (intKey >= start) {
            const value = obj[key];
            delete obj[key];
            if (move > 0 || intKey > start) {
                obj[intKey + move] = value;
            }
        }
    }
}
 function determineLastEvent(e, lastEvent, inChartArea, isClick) {
    if (!inChartArea || e.type === 'mouseout') {
        return null;
    }
    if (isClick) {
        return lastEvent;
    }
    return e;
}
function getSizeForArea(scale, chartArea, field) {
    return scale.options.clip ? scale[field] : chartArea[field];
}
function getDatasetArea(meta, chartArea) {
    const { xScale , yScale  } = meta;
    if (xScale && yScale) {
        return {
            left: getSizeForArea(xScale, chartArea, 'left'),
            right: getSizeForArea(xScale, chartArea, 'right'),
            top: getSizeForArea(yScale, chartArea, 'top'),
            bottom: getSizeForArea(yScale, chartArea, 'bottom')
        };
    }
    return chartArea;
}
class Chart {
    static defaults = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d;
    static instances = instances;
    static overrides = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a3;
    static registry = registry;
    static version = version;
    static getChart = getChart;
    static register(...items) {
        registry.add(...items);
        invalidatePlugins();
    }
    static unregister(...items) {
        registry.remove(...items);
        invalidatePlugins();
    }
    constructor(item, userConfig){
        const config = this.config = new Config(userConfig);
        const initialCanvas = getCanvas(item);
        const existingChart = getChart(initialCanvas);
        if (existingChart) {
            throw new Error('Canvas is already in use. Chart with ID \'' + existingChart.id + '\'' + ' must be destroyed before the canvas with ID \'' + existingChart.canvas.id + '\' can be reused.');
        }
        const options = config.createResolver(config.chartOptionScopes(), this.getContext());
        this.platform = new (config.platform || _detectPlatform(initialCanvas))();
        this.platform.updateConfig(config);
        const context = this.platform.acquireContext(initialCanvas, options.aspectRatio);
        const canvas = context && context.canvas;
        const height = canvas && canvas.height;
        const width = canvas && canvas.width;
        this.id = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ac)();
        this.ctx = context;
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this._options = options;
        this._aspectRatio = this.aspectRatio;
        this._layers = [];
        this._metasets = [];
        this._stacks = undefined;
        this.boxes = [];
        this.currentDevicePixelRatio = undefined;
        this.chartArea = undefined;
        this._active = [];
        this._lastEvent = undefined;
        this._listeners = {};
         this._responsiveListeners = undefined;
        this._sortedMetasets = [];
        this.scales = {};
        this._plugins = new PluginService();
        this.$proxies = {};
        this._hiddenIndices = {};
        this.attached = false;
        this._animationsDisabled = undefined;
        this.$context = undefined;
        this._doResize = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ad)((mode)=>this.update(mode), options.resizeDelay || 0);
        this._dataChanges = [];
        instances[this.id] = this;
        if (!context || !canvas) {
            console.error("Failed to create chart: can't acquire context from the given item");
            return;
        }
        animator.listen(this, 'complete', onAnimationsComplete);
        animator.listen(this, 'progress', onAnimationProgress);
        this._initialize();
        if (this.attached) {
            this.update();
        }
    }
    get aspectRatio() {
        const { options: { aspectRatio , maintainAspectRatio  } , width , height , _aspectRatio  } = this;
        if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(aspectRatio)) {
            return aspectRatio;
        }
        if (maintainAspectRatio && _aspectRatio) {
            return _aspectRatio;
        }
        return height ? width / height : null;
    }
    get data() {
        return this.config.data;
    }
    set data(data) {
        this.config.data = data;
    }
    get options() {
        return this._options;
    }
    set options(options) {
        this.config.options = options;
    }
    get registry() {
        return registry;
    }
 _initialize() {
        this.notifyPlugins('beforeInit');
        if (this.options.responsive) {
            this.resize();
        } else {
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ae)(this, this.options.devicePixelRatio);
        }
        this.bindEvents();
        this.notifyPlugins('afterInit');
        return this;
    }
    clear() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.af)(this.canvas, this.ctx);
        return this;
    }
    stop() {
        animator.stop(this);
        return this;
    }
 resize(width, height) {
        if (!animator.running(this)) {
            this._resize(width, height);
        } else {
            this._resizeBeforeDraw = {
                width,
                height
            };
        }
    }
    _resize(width, height) {
        const options = this.options;
        const canvas = this.canvas;
        const aspectRatio = options.maintainAspectRatio && this.aspectRatio;
        const newSize = this.platform.getMaximumSize(canvas, width, height, aspectRatio);
        const newRatio = options.devicePixelRatio || this.platform.getDevicePixelRatio();
        const mode = this.width ? 'resize' : 'attach';
        this.width = newSize.width;
        this.height = newSize.height;
        this._aspectRatio = this.aspectRatio;
        if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ae)(this, newRatio, true)) {
            return;
        }
        this.notifyPlugins('resize', {
            size: newSize
        });
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(options.onResize, [
            this,
            newSize
        ], this);
        if (this.attached) {
            if (this._doResize(mode)) {
                this.render();
            }
        }
    }
    ensureScalesHaveIDs() {
        const options = this.options;
        const scalesOptions = options.scales || {};
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(scalesOptions, (axisOptions, axisID)=>{
            axisOptions.id = axisID;
        });
    }
 buildOrUpdateScales() {
        const options = this.options;
        const scaleOpts = options.scales;
        const scales = this.scales;
        const updated = Object.keys(scales).reduce((obj, id)=>{
            obj[id] = false;
            return obj;
        }, {});
        let items = [];
        if (scaleOpts) {
            items = items.concat(Object.keys(scaleOpts).map((id)=>{
                const scaleOptions = scaleOpts[id];
                const axis = determineAxis(id, scaleOptions);
                const isRadial = axis === 'r';
                const isHorizontal = axis === 'x';
                return {
                    options: scaleOptions,
                    dposition: isRadial ? 'chartArea' : isHorizontal ? 'bottom' : 'left',
                    dtype: isRadial ? 'radialLinear' : isHorizontal ? 'category' : 'linear'
                };
            }));
        }
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(items, (item)=>{
            const scaleOptions = item.options;
            const id = scaleOptions.id;
            const axis = determineAxis(id, scaleOptions);
            const scaleType = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(scaleOptions.type, item.dtype);
            if (scaleOptions.position === undefined || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) {
                scaleOptions.position = item.dposition;
            }
            updated[id] = true;
            let scale = null;
            if (id in scales && scales[id].type === scaleType) {
                scale = scales[id];
            } else {
                const scaleClass = registry.getScale(scaleType);
                scale = new scaleClass({
                    id,
                    type: scaleType,
                    ctx: this.ctx,
                    chart: this
                });
                scales[scale.id] = scale;
            }
            scale.init(scaleOptions, options);
        });
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(updated, (hasUpdated, id)=>{
            if (!hasUpdated) {
                delete scales[id];
            }
        });
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(scales, (scale)=>{
            layouts.configure(this, scale, scale.options);
            layouts.addBox(this, scale);
        });
    }
 _updateMetasets() {
        const metasets = this._metasets;
        const numData = this.data.datasets.length;
        const numMeta = metasets.length;
        metasets.sort((a, b)=>a.index - b.index);
        if (numMeta > numData) {
            for(let i = numData; i < numMeta; ++i){
                this._destroyDatasetMeta(i);
            }
            metasets.splice(numData, numMeta - numData);
        }
        this._sortedMetasets = metasets.slice(0).sort(compare2Level('order', 'index'));
    }
 _removeUnreferencedMetasets() {
        const { _metasets: metasets , data: { datasets  }  } = this;
        if (metasets.length > datasets.length) {
            delete this._stacks;
        }
        metasets.forEach((meta, index)=>{
            if (datasets.filter((x)=>x === meta._dataset).length === 0) {
                this._destroyDatasetMeta(index);
            }
        });
    }
    buildOrUpdateControllers() {
        const newControllers = [];
        const datasets = this.data.datasets;
        let i, ilen;
        this._removeUnreferencedMetasets();
        for(i = 0, ilen = datasets.length; i < ilen; i++){
            const dataset = datasets[i];
            let meta = this.getDatasetMeta(i);
            const type = dataset.type || this.config.type;
            if (meta.type && meta.type !== type) {
                this._destroyDatasetMeta(i);
                meta = this.getDatasetMeta(i);
            }
            meta.type = type;
            meta.indexAxis = dataset.indexAxis || getIndexAxis(type, this.options);
            meta.order = dataset.order || 0;
            meta.index = i;
            meta.label = '' + dataset.label;
            meta.visible = this.isDatasetVisible(i);
            if (meta.controller) {
                meta.controller.updateIndex(i);
                meta.controller.linkScales();
            } else {
                const ControllerClass = registry.getController(type);
                const { datasetElementType , dataElementType  } = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.datasets[type];
                Object.assign(ControllerClass, {
                    dataElementType: registry.getElement(dataElementType),
                    datasetElementType: datasetElementType && registry.getElement(datasetElementType)
                });
                meta.controller = new ControllerClass(this, i);
                newControllers.push(meta.controller);
            }
        }
        this._updateMetasets();
        return newControllers;
    }
 _resetElements() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this.data.datasets, (dataset, datasetIndex)=>{
            this.getDatasetMeta(datasetIndex).controller.reset();
        }, this);
    }
 reset() {
        this._resetElements();
        this.notifyPlugins('reset');
    }
    update(mode) {
        const config = this.config;
        config.update();
        const options = this._options = config.createResolver(config.chartOptionScopes(), this.getContext());
        const animsDisabled = this._animationsDisabled = !options.animation;
        this._updateScales();
        this._checkEventBindings();
        this._updateHiddenIndices();
        this._plugins.invalidate();
        if (this.notifyPlugins('beforeUpdate', {
            mode,
            cancelable: true
        }) === false) {
            return;
        }
        const newControllers = this.buildOrUpdateControllers();
        this.notifyPlugins('beforeElementsUpdate');
        let minPadding = 0;
        for(let i = 0, ilen = this.data.datasets.length; i < ilen; i++){
            const { controller  } = this.getDatasetMeta(i);
            const reset = !animsDisabled && newControllers.indexOf(controller) === -1;
            controller.buildOrUpdateElements(reset);
            minPadding = Math.max(+controller.getMaxOverflow(), minPadding);
        }
        minPadding = this._minPadding = options.layout.autoPadding ? minPadding : 0;
        this._updateLayout(minPadding);
        if (!animsDisabled) {
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(newControllers, (controller)=>{
                controller.reset();
            });
        }
        this._updateDatasets(mode);
        this.notifyPlugins('afterUpdate', {
            mode
        });
        this._layers.sort(compare2Level('z', '_idx'));
        const { _active , _lastEvent  } = this;
        if (_lastEvent) {
            this._eventHandler(_lastEvent, true);
        } else if (_active.length) {
            this._updateHoverStyles(_active, _active, true);
        }
        this.render();
    }
 _updateScales() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this.scales, (scale)=>{
            layouts.removeBox(this, scale);
        });
        this.ensureScalesHaveIDs();
        this.buildOrUpdateScales();
    }
 _checkEventBindings() {
        const options = this.options;
        const existingEvents = new Set(Object.keys(this._listeners));
        const newEvents = new Set(options.events);
        if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ag)(existingEvents, newEvents) || !!this._responsiveListeners !== options.responsive) {
            this.unbindEvents();
            this.bindEvents();
        }
    }
 _updateHiddenIndices() {
        const { _hiddenIndices  } = this;
        const changes = this._getUniformDataChanges() || [];
        for (const { method , start , count  } of changes){
            const move = method === '_removeElements' ? -count : count;
            moveNumericKeys(_hiddenIndices, start, move);
        }
    }
 _getUniformDataChanges() {
        const _dataChanges = this._dataChanges;
        if (!_dataChanges || !_dataChanges.length) {
            return;
        }
        this._dataChanges = [];
        const datasetCount = this.data.datasets.length;
        const makeSet = (idx)=>new Set(_dataChanges.filter((c)=>c[0] === idx).map((c, i)=>i + ',' + c.splice(1).join(',')));
        const changeSet = makeSet(0);
        for(let i = 1; i < datasetCount; i++){
            if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ag)(changeSet, makeSet(i))) {
                return;
            }
        }
        return Array.from(changeSet).map((c)=>c.split(',')).map((a)=>({
                method: a[1],
                start: +a[2],
                count: +a[3]
            }));
    }
 _updateLayout(minPadding) {
        if (this.notifyPlugins('beforeLayout', {
            cancelable: true
        }) === false) {
            return;
        }
        layouts.update(this, this.width, this.height, minPadding);
        const area = this.chartArea;
        const noArea = area.width <= 0 || area.height <= 0;
        this._layers = [];
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this.boxes, (box)=>{
            if (noArea && box.position === 'chartArea') {
                return;
            }
            if (box.configure) {
                box.configure();
            }
            this._layers.push(...box._layers());
        }, this);
        this._layers.forEach((item, index)=>{
            item._idx = index;
        });
        this.notifyPlugins('afterLayout');
    }
 _updateDatasets(mode) {
        if (this.notifyPlugins('beforeDatasetsUpdate', {
            mode,
            cancelable: true
        }) === false) {
            return;
        }
        for(let i = 0, ilen = this.data.datasets.length; i < ilen; ++i){
            this.getDatasetMeta(i).controller.configure();
        }
        for(let i = 0, ilen = this.data.datasets.length; i < ilen; ++i){
            this._updateDataset(i, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a7)(mode) ? mode({
                datasetIndex: i
            }) : mode);
        }
        this.notifyPlugins('afterDatasetsUpdate', {
            mode
        });
    }
 _updateDataset(index, mode) {
        const meta = this.getDatasetMeta(index);
        const args = {
            meta,
            index,
            mode,
            cancelable: true
        };
        if (this.notifyPlugins('beforeDatasetUpdate', args) === false) {
            return;
        }
        meta.controller._update(mode);
        args.cancelable = false;
        this.notifyPlugins('afterDatasetUpdate', args);
    }
    render() {
        if (this.notifyPlugins('beforeRender', {
            cancelable: true
        }) === false) {
            return;
        }
        if (animator.has(this)) {
            if (this.attached && !animator.running(this)) {
                animator.start(this);
            }
        } else {
            this.draw();
            onAnimationsComplete({
                chart: this
            });
        }
    }
    draw() {
        let i;
        if (this._resizeBeforeDraw) {
            const { width , height  } = this._resizeBeforeDraw;
            this._resize(width, height);
            this._resizeBeforeDraw = null;
        }
        this.clear();
        if (this.width <= 0 || this.height <= 0) {
            return;
        }
        if (this.notifyPlugins('beforeDraw', {
            cancelable: true
        }) === false) {
            return;
        }
        const layers = this._layers;
        for(i = 0; i < layers.length && layers[i].z <= 0; ++i){
            layers[i].draw(this.chartArea);
        }
        this._drawDatasets();
        for(; i < layers.length; ++i){
            layers[i].draw(this.chartArea);
        }
        this.notifyPlugins('afterDraw');
    }
 _getSortedDatasetMetas(filterVisible) {
        const metasets = this._sortedMetasets;
        const result = [];
        let i, ilen;
        for(i = 0, ilen = metasets.length; i < ilen; ++i){
            const meta = metasets[i];
            if (!filterVisible || meta.visible) {
                result.push(meta);
            }
        }
        return result;
    }
 getSortedVisibleDatasetMetas() {
        return this._getSortedDatasetMetas(true);
    }
 _drawDatasets() {
        if (this.notifyPlugins('beforeDatasetsDraw', {
            cancelable: true
        }) === false) {
            return;
        }
        const metasets = this.getSortedVisibleDatasetMetas();
        for(let i = metasets.length - 1; i >= 0; --i){
            this._drawDataset(metasets[i]);
        }
        this.notifyPlugins('afterDatasetsDraw');
    }
 _drawDataset(meta) {
        const ctx = this.ctx;
        const clip = meta._clip;
        const useClip = !clip.disabled;
        const area = getDatasetArea(meta, this.chartArea);
        const args = {
            meta,
            index: meta.index,
            cancelable: true
        };
        if (this.notifyPlugins('beforeDatasetDraw', args) === false) {
            return;
        }
        if (useClip) {
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Y)(ctx, {
                left: clip.left === false ? 0 : area.left - clip.left,
                right: clip.right === false ? this.width : area.right + clip.right,
                top: clip.top === false ? 0 : area.top - clip.top,
                bottom: clip.bottom === false ? this.height : area.bottom + clip.bottom
            });
        }
        meta.controller.draw();
        if (useClip) {
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.$)(ctx);
        }
        args.cancelable = false;
        this.notifyPlugins('afterDatasetDraw', args);
    }
 isPointInArea(point) {
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)(point, this.chartArea, this._minPadding);
    }
    getElementsAtEventForMode(e, mode, options, useFinalPosition) {
        const method = Interaction.modes[mode];
        if (typeof method === 'function') {
            return method(this, e, options, useFinalPosition);
        }
        return [];
    }
    getDatasetMeta(datasetIndex) {
        const dataset = this.data.datasets[datasetIndex];
        const metasets = this._metasets;
        let meta = metasets.filter((x)=>x && x._dataset === dataset).pop();
        if (!meta) {
            meta = {
                type: null,
                data: [],
                dataset: null,
                controller: null,
                hidden: null,
                xAxisID: null,
                yAxisID: null,
                order: dataset && dataset.order || 0,
                index: datasetIndex,
                _dataset: dataset,
                _parsed: [],
                _sorted: false
            };
            metasets.push(meta);
        }
        return meta;
    }
    getContext() {
        return this.$context || (this.$context = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(null, {
            chart: this,
            type: 'chart'
        }));
    }
    getVisibleDatasetCount() {
        return this.getSortedVisibleDatasetMetas().length;
    }
    isDatasetVisible(datasetIndex) {
        const dataset = this.data.datasets[datasetIndex];
        if (!dataset) {
            return false;
        }
        const meta = this.getDatasetMeta(datasetIndex);
        return typeof meta.hidden === 'boolean' ? !meta.hidden : !dataset.hidden;
    }
    setDatasetVisibility(datasetIndex, visible) {
        const meta = this.getDatasetMeta(datasetIndex);
        meta.hidden = !visible;
    }
    toggleDataVisibility(index) {
        this._hiddenIndices[index] = !this._hiddenIndices[index];
    }
    getDataVisibility(index) {
        return !this._hiddenIndices[index];
    }
 _updateVisibility(datasetIndex, dataIndex, visible) {
        const mode = visible ? 'show' : 'hide';
        const meta = this.getDatasetMeta(datasetIndex);
        const anims = meta.controller._resolveAnimations(undefined, mode);
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.h)(dataIndex)) {
            meta.data[dataIndex].hidden = !visible;
            this.update();
        } else {
            this.setDatasetVisibility(datasetIndex, visible);
            anims.update(meta, {
                visible
            });
            this.update((ctx)=>ctx.datasetIndex === datasetIndex ? mode : undefined);
        }
    }
    hide(datasetIndex, dataIndex) {
        this._updateVisibility(datasetIndex, dataIndex, false);
    }
    show(datasetIndex, dataIndex) {
        this._updateVisibility(datasetIndex, dataIndex, true);
    }
 _destroyDatasetMeta(datasetIndex) {
        const meta = this._metasets[datasetIndex];
        if (meta && meta.controller) {
            meta.controller._destroy();
        }
        delete this._metasets[datasetIndex];
    }
    _stop() {
        let i, ilen;
        this.stop();
        animator.remove(this);
        for(i = 0, ilen = this.data.datasets.length; i < ilen; ++i){
            this._destroyDatasetMeta(i);
        }
    }
    destroy() {
        this.notifyPlugins('beforeDestroy');
        const { canvas , ctx  } = this;
        this._stop();
        this.config.clearCache();
        if (canvas) {
            this.unbindEvents();
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.af)(canvas, ctx);
            this.platform.releaseContext(ctx);
            this.canvas = null;
            this.ctx = null;
        }
        delete instances[this.id];
        this.notifyPlugins('afterDestroy');
    }
    toBase64Image(...args) {
        return this.canvas.toDataURL(...args);
    }
 bindEvents() {
        this.bindUserEvents();
        if (this.options.responsive) {
            this.bindResponsiveEvents();
        } else {
            this.attached = true;
        }
    }
 bindUserEvents() {
        const listeners = this._listeners;
        const platform = this.platform;
        const _add = (type, listener)=>{
            platform.addEventListener(this, type, listener);
            listeners[type] = listener;
        };
        const listener = (e, x, y)=>{
            e.offsetX = x;
            e.offsetY = y;
            this._eventHandler(e);
        };
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this.options.events, (type)=>_add(type, listener));
    }
 bindResponsiveEvents() {
        if (!this._responsiveListeners) {
            this._responsiveListeners = {};
        }
        const listeners = this._responsiveListeners;
        const platform = this.platform;
        const _add = (type, listener)=>{
            platform.addEventListener(this, type, listener);
            listeners[type] = listener;
        };
        const _remove = (type, listener)=>{
            if (listeners[type]) {
                platform.removeEventListener(this, type, listener);
                delete listeners[type];
            }
        };
        const listener = (width, height)=>{
            if (this.canvas) {
                this.resize(width, height);
            }
        };
        let detached;
        const attached = ()=>{
            _remove('attach', attached);
            this.attached = true;
            this.resize();
            _add('resize', listener);
            _add('detach', detached);
        };
        detached = ()=>{
            this.attached = false;
            _remove('resize', listener);
            this._stop();
            this._resize(0, 0);
            _add('attach', attached);
        };
        if (platform.isAttached(this.canvas)) {
            attached();
        } else {
            detached();
        }
    }
 unbindEvents() {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this._listeners, (listener, type)=>{
            this.platform.removeEventListener(this, type, listener);
        });
        this._listeners = {};
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this._responsiveListeners, (listener, type)=>{
            this.platform.removeEventListener(this, type, listener);
        });
        this._responsiveListeners = undefined;
    }
    updateHoverStyle(items, mode, enabled) {
        const prefix = enabled ? 'set' : 'remove';
        let meta, item, i, ilen;
        if (mode === 'dataset') {
            meta = this.getDatasetMeta(items[0].datasetIndex);
            meta.controller['_' + prefix + 'DatasetHoverStyle']();
        }
        for(i = 0, ilen = items.length; i < ilen; ++i){
            item = items[i];
            const controller = item && this.getDatasetMeta(item.datasetIndex).controller;
            if (controller) {
                controller[prefix + 'HoverStyle'](item.element, item.datasetIndex, item.index);
            }
        }
    }
 getActiveElements() {
        return this._active || [];
    }
 setActiveElements(activeElements) {
        const lastActive = this._active || [];
        const active = activeElements.map(({ datasetIndex , index  })=>{
            const meta = this.getDatasetMeta(datasetIndex);
            if (!meta) {
                throw new Error('No dataset found at index ' + datasetIndex);
            }
            return {
                datasetIndex,
                element: meta.data[index],
                index
            };
        });
        const changed = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ah)(active, lastActive);
        if (changed) {
            this._active = active;
            this._lastEvent = null;
            this._updateHoverStyles(active, lastActive);
        }
    }
 notifyPlugins(hook, args, filter) {
        return this._plugins.notify(this, hook, args, filter);
    }
 isPluginEnabled(pluginId) {
        return this._plugins._cache.filter((p)=>p.plugin.id === pluginId).length === 1;
    }
 _updateHoverStyles(active, lastActive, replay) {
        const hoverOptions = this.options.hover;
        const diff = (a, b)=>a.filter((x)=>!b.some((y)=>x.datasetIndex === y.datasetIndex && x.index === y.index));
        const deactivated = diff(lastActive, active);
        const activated = replay ? active : diff(active, lastActive);
        if (deactivated.length) {
            this.updateHoverStyle(deactivated, hoverOptions.mode, false);
        }
        if (activated.length && hoverOptions.mode) {
            this.updateHoverStyle(activated, hoverOptions.mode, true);
        }
    }
 _eventHandler(e, replay) {
        const args = {
            event: e,
            replay,
            cancelable: true,
            inChartArea: this.isPointInArea(e)
        };
        const eventFilter = (plugin)=>(plugin.options.events || this.options.events).includes(e.native.type);
        if (this.notifyPlugins('beforeEvent', args, eventFilter) === false) {
            return;
        }
        const changed = this._handleEvent(e, replay, args.inChartArea);
        args.cancelable = false;
        this.notifyPlugins('afterEvent', args, eventFilter);
        if (changed || args.changed) {
            this.render();
        }
        return this;
    }
 _handleEvent(e, replay, inChartArea) {
        const { _active: lastActive = [] , options  } = this;
        const useFinalPosition = replay;
        const active = this._getActiveElements(e, lastActive, inChartArea, useFinalPosition);
        const isClick = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ai)(e);
        const lastEvent = determineLastEvent(e, this._lastEvent, inChartArea, isClick);
        if (inChartArea) {
            this._lastEvent = null;
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(options.onHover, [
                e,
                active,
                this
            ], this);
            if (isClick) {
                (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(options.onClick, [
                    e,
                    active,
                    this
                ], this);
            }
        }
        const changed = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ah)(active, lastActive);
        if (changed || replay) {
            this._active = active;
            this._updateHoverStyles(active, lastActive, replay);
        }
        this._lastEvent = lastEvent;
        return changed;
    }
 _getActiveElements(e, lastActive, inChartArea, useFinalPosition) {
        if (e.type === 'mouseout') {
            return [];
        }
        if (!inChartArea) {
            return lastActive;
        }
        const hoverOptions = this.options.hover;
        return this.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions, useFinalPosition);
    }
}
function invalidatePlugins() {
    return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(Chart.instances, (chart)=>chart._plugins.invalidate());
}

function clipArc(ctx, element, endAngle) {
    const { startAngle , pixelMargin , x , y , outerRadius , innerRadius  } = element;
    let angleMargin = pixelMargin / outerRadius;
    // Draw an inner border by clipping the arc and drawing a double-width border
    // Enlarge the clipping arc by 0.33 pixels to eliminate glitches between borders
    ctx.beginPath();
    ctx.arc(x, y, outerRadius, startAngle - angleMargin, endAngle + angleMargin);
    if (innerRadius > pixelMargin) {
        angleMargin = pixelMargin / innerRadius;
        ctx.arc(x, y, innerRadius, endAngle + angleMargin, startAngle - angleMargin, true);
    } else {
        ctx.arc(x, y, pixelMargin, endAngle + _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H, startAngle - _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H);
    }
    ctx.closePath();
    ctx.clip();
}
function toRadiusCorners(value) {
    return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ak)(value, [
        'outerStart',
        'outerEnd',
        'innerStart',
        'innerEnd'
    ]);
}
/**
 * Parse border radius from the provided options
 */ function parseBorderRadius$1(arc, innerRadius, outerRadius, angleDelta) {
    const o = toRadiusCorners(arc.options.borderRadius);
    const halfThickness = (outerRadius - innerRadius) / 2;
    const innerLimit = Math.min(halfThickness, angleDelta * innerRadius / 2);
    // Outer limits are complicated. We want to compute the available angular distance at
    // a radius of outerRadius - borderRadius because for small angular distances, this term limits.
    // We compute at r = outerRadius - borderRadius because this circle defines the center of the border corners.
    //
    // If the borderRadius is large, that value can become negative.
    // This causes the outer borders to lose their radius entirely, which is rather unexpected. To solve that, if borderRadius > outerRadius
    // we know that the thickness term will dominate and compute the limits at that point
    const computeOuterLimit = (val)=>{
        const outerArcLimit = (outerRadius - Math.min(halfThickness, val)) * angleDelta / 2;
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(val, 0, Math.min(halfThickness, outerArcLimit));
    };
    return {
        outerStart: computeOuterLimit(o.outerStart),
        outerEnd: computeOuterLimit(o.outerEnd),
        innerStart: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(o.innerStart, 0, innerLimit),
        innerEnd: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(o.innerEnd, 0, innerLimit)
    };
}
/**
 * Convert (r, 𝜃) to (x, y)
 */ function rThetaToXY(r, theta, x, y) {
    return {
        x: x + r * Math.cos(theta),
        y: y + r * Math.sin(theta)
    };
}
/**
 * Path the arc, respecting border radius by separating into left and right halves.
 *
 *   Start      End
 *
 *    1--->a--->2    Outer
 *   /           \
 *   8           3
 *   |           |
 *   |           |
 *   7           4
 *   \           /
 *    6<---b<---5    Inner
 */ function pathArc(ctx, element, offset, spacing, end, circular) {
    const { x , y , startAngle: start , pixelMargin , innerRadius: innerR  } = element;
    const outerRadius = Math.max(element.outerRadius + spacing + offset - pixelMargin, 0);
    const innerRadius = innerR > 0 ? innerR + spacing + offset + pixelMargin : 0;
    let spacingOffset = 0;
    const alpha = end - start;
    if (spacing) {
        // When spacing is present, it is the same for all items
        // So we adjust the start and end angle of the arc such that
        // the distance is the same as it would be without the spacing
        const noSpacingInnerRadius = innerR > 0 ? innerR - spacing : 0;
        const noSpacingOuterRadius = outerRadius > 0 ? outerRadius - spacing : 0;
        const avNogSpacingRadius = (noSpacingInnerRadius + noSpacingOuterRadius) / 2;
        const adjustedAngle = avNogSpacingRadius !== 0 ? alpha * avNogSpacingRadius / (avNogSpacingRadius + spacing) : alpha;
        spacingOffset = (alpha - adjustedAngle) / 2;
    }
    const beta = Math.max(0.001, alpha * outerRadius - offset / _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P) / outerRadius;
    const angleOffset = (alpha - beta) / 2;
    const startAngle = start + angleOffset + spacingOffset;
    const endAngle = end - angleOffset - spacingOffset;
    const { outerStart , outerEnd , innerStart , innerEnd  } = parseBorderRadius$1(element, innerRadius, outerRadius, endAngle - startAngle);
    const outerStartAdjustedRadius = outerRadius - outerStart;
    const outerEndAdjustedRadius = outerRadius - outerEnd;
    const outerStartAdjustedAngle = startAngle + outerStart / outerStartAdjustedRadius;
    const outerEndAdjustedAngle = endAngle - outerEnd / outerEndAdjustedRadius;
    const innerStartAdjustedRadius = innerRadius + innerStart;
    const innerEndAdjustedRadius = innerRadius + innerEnd;
    const innerStartAdjustedAngle = startAngle + innerStart / innerStartAdjustedRadius;
    const innerEndAdjustedAngle = endAngle - innerEnd / innerEndAdjustedRadius;
    ctx.beginPath();
    if (circular) {
        // The first arc segments from point 1 to point a to point 2
        const outerMidAdjustedAngle = (outerStartAdjustedAngle + outerEndAdjustedAngle) / 2;
        ctx.arc(x, y, outerRadius, outerStartAdjustedAngle, outerMidAdjustedAngle);
        ctx.arc(x, y, outerRadius, outerMidAdjustedAngle, outerEndAdjustedAngle);
        // The corner segment from point 2 to point 3
        if (outerEnd > 0) {
            const pCenter = rThetaToXY(outerEndAdjustedRadius, outerEndAdjustedAngle, x, y);
            ctx.arc(pCenter.x, pCenter.y, outerEnd, outerEndAdjustedAngle, endAngle + _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H);
        }
        // The line from point 3 to point 4
        const p4 = rThetaToXY(innerEndAdjustedRadius, endAngle, x, y);
        ctx.lineTo(p4.x, p4.y);
        // The corner segment from point 4 to point 5
        if (innerEnd > 0) {
            const pCenter = rThetaToXY(innerEndAdjustedRadius, innerEndAdjustedAngle, x, y);
            ctx.arc(pCenter.x, pCenter.y, innerEnd, endAngle + _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H, innerEndAdjustedAngle + Math.PI);
        }
        // The inner arc from point 5 to point b to point 6
        const innerMidAdjustedAngle = (endAngle - innerEnd / innerRadius + (startAngle + innerStart / innerRadius)) / 2;
        ctx.arc(x, y, innerRadius, endAngle - innerEnd / innerRadius, innerMidAdjustedAngle, true);
        ctx.arc(x, y, innerRadius, innerMidAdjustedAngle, startAngle + innerStart / innerRadius, true);
        // The corner segment from point 6 to point 7
        if (innerStart > 0) {
            const pCenter = rThetaToXY(innerStartAdjustedRadius, innerStartAdjustedAngle, x, y);
            ctx.arc(pCenter.x, pCenter.y, innerStart, innerStartAdjustedAngle + Math.PI, startAngle - _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H);
        }
        // The line from point 7 to point 8
        const p8 = rThetaToXY(outerStartAdjustedRadius, startAngle, x, y);
        ctx.lineTo(p8.x, p8.y);
        // The corner segment from point 8 to point 1
        if (outerStart > 0) {
            const pCenter = rThetaToXY(outerStartAdjustedRadius, outerStartAdjustedAngle, x, y);
            ctx.arc(pCenter.x, pCenter.y, outerStart, startAngle - _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H, outerStartAdjustedAngle);
        }
    } else {
        ctx.moveTo(x, y);
        const outerStartX = Math.cos(outerStartAdjustedAngle) * outerRadius + x;
        const outerStartY = Math.sin(outerStartAdjustedAngle) * outerRadius + y;
        ctx.lineTo(outerStartX, outerStartY);
        const outerEndX = Math.cos(outerEndAdjustedAngle) * outerRadius + x;
        const outerEndY = Math.sin(outerEndAdjustedAngle) * outerRadius + y;
        ctx.lineTo(outerEndX, outerEndY);
    }
    ctx.closePath();
}
function drawArc(ctx, element, offset, spacing, circular) {
    const { fullCircles , startAngle , circumference  } = element;
    let endAngle = element.endAngle;
    if (fullCircles) {
        pathArc(ctx, element, offset, spacing, endAngle, circular);
        for(let i = 0; i < fullCircles; ++i){
            ctx.fill();
        }
        if (!isNaN(circumference)) {
            endAngle = startAngle + (circumference % _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T || _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T);
        }
    }
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    ctx.fill();
    return endAngle;
}
function drawBorder(ctx, element, offset, spacing, circular) {
    const { fullCircles , startAngle , circumference , options  } = element;
    const { borderWidth , borderJoinStyle , borderDash , borderDashOffset  } = options;
    const inner = options.borderAlign === 'inner';
    if (!borderWidth) {
        return;
    }
    ctx.setLineDash(borderDash || []);
    ctx.lineDashOffset = borderDashOffset;
    if (inner) {
        ctx.lineWidth = borderWidth * 2;
        ctx.lineJoin = borderJoinStyle || 'round';
    } else {
        ctx.lineWidth = borderWidth;
        ctx.lineJoin = borderJoinStyle || 'bevel';
    }
    let endAngle = element.endAngle;
    if (fullCircles) {
        pathArc(ctx, element, offset, spacing, endAngle, circular);
        for(let i = 0; i < fullCircles; ++i){
            ctx.stroke();
        }
        if (!isNaN(circumference)) {
            endAngle = startAngle + (circumference % _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T || _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T);
        }
    }
    if (inner) {
        clipArc(ctx, element, endAngle);
    }
    if (!fullCircles) {
        pathArc(ctx, element, offset, spacing, endAngle, circular);
        ctx.stroke();
    }
}
class ArcElement extends Element {
    static id = 'arc';
    static defaults = {
        borderAlign: 'center',
        borderColor: '#fff',
        borderDash: [],
        borderDashOffset: 0,
        borderJoinStyle: undefined,
        borderRadius: 0,
        borderWidth: 2,
        offset: 0,
        spacing: 0,
        angle: undefined,
        circular: true
    };
    static defaultRoutes = {
        backgroundColor: 'backgroundColor'
    };
    static descriptors = {
        _scriptable: true,
        _indexable: (name)=>name !== 'borderDash'
    };
    circumference;
    endAngle;
    fullCircles;
    innerRadius;
    outerRadius;
    pixelMargin;
    startAngle;
    constructor(cfg){
        super();
        this.options = undefined;
        this.circumference = undefined;
        this.startAngle = undefined;
        this.endAngle = undefined;
        this.innerRadius = undefined;
        this.outerRadius = undefined;
        this.pixelMargin = 0;
        this.fullCircles = 0;
        if (cfg) {
            Object.assign(this, cfg);
        }
    }
    inRange(chartX, chartY, useFinalPosition) {
        const point = this.getProps([
            'x',
            'y'
        ], useFinalPosition);
        const { angle , distance  } = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.D)(point, {
            x: chartX,
            y: chartY
        });
        const { startAngle , endAngle , innerRadius , outerRadius , circumference  } = this.getProps([
            'startAngle',
            'endAngle',
            'innerRadius',
            'outerRadius',
            'circumference'
        ], useFinalPosition);
        const rAdjust = (this.options.spacing + this.options.borderWidth) / 2;
        const _circumference = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(circumference, endAngle - startAngle);
        const betweenAngles = _circumference >= _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.p)(angle, startAngle, endAngle);
        const withinRadius = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(distance, innerRadius + rAdjust, outerRadius + rAdjust);
        return betweenAngles && withinRadius;
    }
    getCenterPoint(useFinalPosition) {
        const { x , y , startAngle , endAngle , innerRadius , outerRadius  } = this.getProps([
            'x',
            'y',
            'startAngle',
            'endAngle',
            'innerRadius',
            'outerRadius'
        ], useFinalPosition);
        const { offset , spacing  } = this.options;
        const halfAngle = (startAngle + endAngle) / 2;
        const halfRadius = (innerRadius + outerRadius + spacing + offset) / 2;
        return {
            x: x + Math.cos(halfAngle) * halfRadius,
            y: y + Math.sin(halfAngle) * halfRadius
        };
    }
    tooltipPosition(useFinalPosition) {
        return this.getCenterPoint(useFinalPosition);
    }
    draw(ctx) {
        const { options , circumference  } = this;
        const offset = (options.offset || 0) / 4;
        const spacing = (options.spacing || 0) / 2;
        const circular = options.circular;
        this.pixelMargin = options.borderAlign === 'inner' ? 0.33 : 0;
        this.fullCircles = circumference > _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T ? Math.floor(circumference / _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T) : 0;
        if (circumference === 0 || this.innerRadius < 0 || this.outerRadius < 0) {
            return;
        }
        ctx.save();
        const halfAngle = (this.startAngle + this.endAngle) / 2;
        ctx.translate(Math.cos(halfAngle) * offset, Math.sin(halfAngle) * offset);
        const fix = 1 - Math.sin(Math.min(_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P, circumference || 0));
        const radiusOffset = offset * fix;
        ctx.fillStyle = options.backgroundColor;
        ctx.strokeStyle = options.borderColor;
        drawArc(ctx, this, radiusOffset, spacing, circular);
        drawBorder(ctx, this, radiusOffset, spacing, circular);
        ctx.restore();
    }
}

function setStyle(ctx, options, style = options) {
    ctx.lineCap = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(style.borderCapStyle, options.borderCapStyle);
    ctx.setLineDash((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(style.borderDash, options.borderDash));
    ctx.lineDashOffset = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(style.borderDashOffset, options.borderDashOffset);
    ctx.lineJoin = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(style.borderJoinStyle, options.borderJoinStyle);
    ctx.lineWidth = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(style.borderWidth, options.borderWidth);
    ctx.strokeStyle = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(style.borderColor, options.borderColor);
}
function lineTo(ctx, previous, target) {
    ctx.lineTo(target.x, target.y);
}
 function getLineMethod(options) {
    if (options.stepped) {
        return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ar;
    }
    if (options.tension || options.cubicInterpolationMode === 'monotone') {
        return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.as;
    }
    return lineTo;
}
function pathVars(points, segment, params = {}) {
    const count = points.length;
    const { start: paramsStart = 0 , end: paramsEnd = count - 1  } = params;
    const { start: segmentStart , end: segmentEnd  } = segment;
    const start = Math.max(paramsStart, segmentStart);
    const end = Math.min(paramsEnd, segmentEnd);
    const outside = paramsStart < segmentStart && paramsEnd < segmentStart || paramsStart > segmentEnd && paramsEnd > segmentEnd;
    return {
        count,
        start,
        loop: segment.loop,
        ilen: end < start && !outside ? count + end - start : end - start
    };
}
 function pathSegment(ctx, line, segment, params) {
    const { points , options  } = line;
    const { count , start , loop , ilen  } = pathVars(points, segment, params);
    const lineMethod = getLineMethod(options);
    let { move =true , reverse  } = params || {};
    let i, point, prev;
    for(i = 0; i <= ilen; ++i){
        point = points[(start + (reverse ? ilen - i : i)) % count];
        if (point.skip) {
            continue;
        } else if (move) {
            ctx.moveTo(point.x, point.y);
            move = false;
        } else {
            lineMethod(ctx, prev, point, reverse, options.stepped);
        }
        prev = point;
    }
    if (loop) {
        point = points[(start + (reverse ? ilen : 0)) % count];
        lineMethod(ctx, prev, point, reverse, options.stepped);
    }
    return !!loop;
}
 function fastPathSegment(ctx, line, segment, params) {
    const points = line.points;
    const { count , start , ilen  } = pathVars(points, segment, params);
    const { move =true , reverse  } = params || {};
    let avgX = 0;
    let countX = 0;
    let i, point, prevX, minY, maxY, lastY;
    const pointIndex = (index)=>(start + (reverse ? ilen - index : index)) % count;
    const drawX = ()=>{
        if (minY !== maxY) {
            ctx.lineTo(avgX, maxY);
            ctx.lineTo(avgX, minY);
            ctx.lineTo(avgX, lastY);
        }
    };
    if (move) {
        point = points[pointIndex(0)];
        ctx.moveTo(point.x, point.y);
    }
    for(i = 0; i <= ilen; ++i){
        point = points[pointIndex(i)];
        if (point.skip) {
            continue;
        }
        const x = point.x;
        const y = point.y;
        const truncX = x | 0;
        if (truncX === prevX) {
            if (y < minY) {
                minY = y;
            } else if (y > maxY) {
                maxY = y;
            }
            avgX = (countX * avgX + x) / ++countX;
        } else {
            drawX();
            ctx.lineTo(x, y);
            prevX = truncX;
            countX = 0;
            minY = maxY = y;
        }
        lastY = y;
    }
    drawX();
}
 function _getSegmentMethod(line) {
    const opts = line.options;
    const borderDash = opts.borderDash && opts.borderDash.length;
    const useFastPath = !line._decimated && !line._loop && !opts.tension && opts.cubicInterpolationMode !== 'monotone' && !opts.stepped && !borderDash;
    return useFastPath ? fastPathSegment : pathSegment;
}
 function _getInterpolationMethod(options) {
    if (options.stepped) {
        return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ao;
    }
    if (options.tension || options.cubicInterpolationMode === 'monotone') {
        return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ap;
    }
    return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aq;
}
function strokePathWithCache(ctx, line, start, count) {
    let path = line._path;
    if (!path) {
        path = line._path = new Path2D();
        if (line.path(path, start, count)) {
            path.closePath();
        }
    }
    setStyle(ctx, line.options);
    ctx.stroke(path);
}
function strokePathDirect(ctx, line, start, count) {
    const { segments , options  } = line;
    const segmentMethod = _getSegmentMethod(line);
    for (const segment of segments){
        setStyle(ctx, options, segment.style);
        ctx.beginPath();
        if (segmentMethod(ctx, line, segment, {
            start,
            end: start + count - 1
        })) {
            ctx.closePath();
        }
        ctx.stroke();
    }
}
const usePath2D = typeof Path2D === 'function';
function draw(ctx, line, start, count) {
    if (usePath2D && !line.options.segment) {
        strokePathWithCache(ctx, line, start, count);
    } else {
        strokePathDirect(ctx, line, start, count);
    }
}
class LineElement extends Element {
    static id = 'line';
 static defaults = {
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0,
        borderJoinStyle: 'miter',
        borderWidth: 3,
        capBezierPoints: true,
        cubicInterpolationMode: 'default',
        fill: false,
        spanGaps: false,
        stepped: false,
        tension: 0
    };
 static defaultRoutes = {
        backgroundColor: 'backgroundColor',
        borderColor: 'borderColor'
    };
    static descriptors = {
        _scriptable: true,
        _indexable: (name)=>name !== 'borderDash' && name !== 'fill'
    };
    constructor(cfg){
        super();
        this.animated = true;
        this.options = undefined;
        this._chart = undefined;
        this._loop = undefined;
        this._fullLoop = undefined;
        this._path = undefined;
        this._points = undefined;
        this._segments = undefined;
        this._decimated = false;
        this._pointsUpdated = false;
        this._datasetIndex = undefined;
        if (cfg) {
            Object.assign(this, cfg);
        }
    }
    updateControlPoints(chartArea, indexAxis) {
        const options = this.options;
        if ((options.tension || options.cubicInterpolationMode === 'monotone') && !options.stepped && !this._pointsUpdated) {
            const loop = options.spanGaps ? this._loop : this._fullLoop;
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.al)(this._points, options, chartArea, loop, indexAxis);
            this._pointsUpdated = true;
        }
    }
    set points(points) {
        this._points = points;
        delete this._segments;
        delete this._path;
        this._pointsUpdated = false;
    }
    get points() {
        return this._points;
    }
    get segments() {
        return this._segments || (this._segments = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.am)(this, this.options.segment));
    }
 first() {
        const segments = this.segments;
        const points = this.points;
        return segments.length && points[segments[0].start];
    }
 last() {
        const segments = this.segments;
        const points = this.points;
        const count = segments.length;
        return count && points[segments[count - 1].end];
    }
 interpolate(point, property) {
        const options = this.options;
        const value = point[property];
        const points = this.points;
        const segments = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.an)(this, {
            property,
            start: value,
            end: value
        });
        if (!segments.length) {
            return;
        }
        const result = [];
        const _interpolate = _getInterpolationMethod(options);
        let i, ilen;
        for(i = 0, ilen = segments.length; i < ilen; ++i){
            const { start , end  } = segments[i];
            const p1 = points[start];
            const p2 = points[end];
            if (p1 === p2) {
                result.push(p1);
                continue;
            }
            const t = Math.abs((value - p1[property]) / (p2[property] - p1[property]));
            const interpolated = _interpolate(p1, p2, t, options.stepped);
            interpolated[property] = point[property];
            result.push(interpolated);
        }
        return result.length === 1 ? result[0] : result;
    }
 pathSegment(ctx, segment, params) {
        const segmentMethod = _getSegmentMethod(this);
        return segmentMethod(ctx, this, segment, params);
    }
 path(ctx, start, count) {
        const segments = this.segments;
        const segmentMethod = _getSegmentMethod(this);
        let loop = this._loop;
        start = start || 0;
        count = count || this.points.length - start;
        for (const segment of segments){
            loop &= segmentMethod(ctx, this, segment, {
                start,
                end: start + count - 1
            });
        }
        return !!loop;
    }
 draw(ctx, chartArea, start, count) {
        const options = this.options || {};
        const points = this.points || [];
        if (points.length && options.borderWidth) {
            ctx.save();
            draw(ctx, this, start, count);
            ctx.restore();
        }
        if (this.animated) {
            this._pointsUpdated = false;
            this._path = undefined;
        }
    }
}

function inRange$1(el, pos, axis, useFinalPosition) {
    const options = el.options;
    const { [axis]: value  } = el.getProps([
        axis
    ], useFinalPosition);
    return Math.abs(pos - value) < options.radius + options.hitRadius;
}
class PointElement extends Element {
    static id = 'point';
    parsed;
    skip;
    stop;
    /**
   * @type {any}
   */ static defaults = {
        borderWidth: 1,
        hitRadius: 1,
        hoverBorderWidth: 1,
        hoverRadius: 4,
        pointStyle: 'circle',
        radius: 3,
        rotation: 0
    };
    /**
   * @type {any}
   */ static defaultRoutes = {
        backgroundColor: 'backgroundColor',
        borderColor: 'borderColor'
    };
    constructor(cfg){
        super();
        this.options = undefined;
        this.parsed = undefined;
        this.skip = undefined;
        this.stop = undefined;
        if (cfg) {
            Object.assign(this, cfg);
        }
    }
    inRange(mouseX, mouseY, useFinalPosition) {
        const options = this.options;
        const { x , y  } = this.getProps([
            'x',
            'y'
        ], useFinalPosition);
        return Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2) < Math.pow(options.hitRadius + options.radius, 2);
    }
    inXRange(mouseX, useFinalPosition) {
        return inRange$1(this, mouseX, 'x', useFinalPosition);
    }
    inYRange(mouseY, useFinalPosition) {
        return inRange$1(this, mouseY, 'y', useFinalPosition);
    }
    getCenterPoint(useFinalPosition) {
        const { x , y  } = this.getProps([
            'x',
            'y'
        ], useFinalPosition);
        return {
            x,
            y
        };
    }
    size(options) {
        options = options || this.options || {};
        let radius = options.radius || 0;
        radius = Math.max(radius, radius && options.hoverRadius || 0);
        const borderWidth = radius && options.borderWidth || 0;
        return (radius + borderWidth) * 2;
    }
    draw(ctx, area) {
        const options = this.options;
        if (this.skip || options.radius < 0.1 || !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)(this, area, this.size(options) / 2)) {
            return;
        }
        ctx.strokeStyle = options.borderColor;
        ctx.lineWidth = options.borderWidth;
        ctx.fillStyle = options.backgroundColor;
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.at)(ctx, options, this.x, this.y);
    }
    getRange() {
        const options = this.options || {};
        // @ts-expect-error Fallbacks should never be hit in practice
        return options.radius + options.hitRadius;
    }
}

function getBarBounds(bar, useFinalPosition) {
    const { x , y , base , width , height  } =  bar.getProps([
        'x',
        'y',
        'base',
        'width',
        'height'
    ], useFinalPosition);
    let left, right, top, bottom, half;
    if (bar.horizontal) {
        half = height / 2;
        left = Math.min(x, base);
        right = Math.max(x, base);
        top = y - half;
        bottom = y + half;
    } else {
        half = width / 2;
        left = x - half;
        right = x + half;
        top = Math.min(y, base);
        bottom = Math.max(y, base);
    }
    return {
        left,
        top,
        right,
        bottom
    };
}
function skipOrLimit(skip, value, min, max) {
    return skip ? 0 : (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(value, min, max);
}
function parseBorderWidth(bar, maxW, maxH) {
    const value = bar.options.borderWidth;
    const skip = bar.borderSkipped;
    const o = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.av)(value);
    return {
        t: skipOrLimit(skip.top, o.top, 0, maxH),
        r: skipOrLimit(skip.right, o.right, 0, maxW),
        b: skipOrLimit(skip.bottom, o.bottom, 0, maxH),
        l: skipOrLimit(skip.left, o.left, 0, maxW)
    };
}
function parseBorderRadius(bar, maxW, maxH) {
    const { enableBorderRadius  } = bar.getProps([
        'enableBorderRadius'
    ]);
    const value = bar.options.borderRadius;
    const o = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(value);
    const maxR = Math.min(maxW, maxH);
    const skip = bar.borderSkipped;
    const enableBorder = enableBorderRadius || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(value);
    return {
        topLeft: skipOrLimit(!enableBorder || skip.top || skip.left, o.topLeft, 0, maxR),
        topRight: skipOrLimit(!enableBorder || skip.top || skip.right, o.topRight, 0, maxR),
        bottomLeft: skipOrLimit(!enableBorder || skip.bottom || skip.left, o.bottomLeft, 0, maxR),
        bottomRight: skipOrLimit(!enableBorder || skip.bottom || skip.right, o.bottomRight, 0, maxR)
    };
}
function boundingRects(bar) {
    const bounds = getBarBounds(bar);
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    const border = parseBorderWidth(bar, width / 2, height / 2);
    const radius = parseBorderRadius(bar, width / 2, height / 2);
    return {
        outer: {
            x: bounds.left,
            y: bounds.top,
            w: width,
            h: height,
            radius
        },
        inner: {
            x: bounds.left + border.l,
            y: bounds.top + border.t,
            w: width - border.l - border.r,
            h: height - border.t - border.b,
            radius: {
                topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)),
                topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)),
                bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)),
                bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r))
            }
        }
    };
}
function inRange(bar, x, y, useFinalPosition) {
    const skipX = x === null;
    const skipY = y === null;
    const skipBoth = skipX && skipY;
    const bounds = bar && !skipBoth && getBarBounds(bar, useFinalPosition);
    return bounds && (skipX || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(x, bounds.left, bounds.right)) && (skipY || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(y, bounds.top, bounds.bottom));
}
function hasRadius(radius) {
    return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight;
}
 function addNormalRectPath(ctx, rect) {
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
}
function inflateRect(rect, amount, refRect = {}) {
    const x = rect.x !== refRect.x ? -amount : 0;
    const y = rect.y !== refRect.y ? -amount : 0;
    const w = (rect.x + rect.w !== refRect.x + refRect.w ? amount : 0) - x;
    const h = (rect.y + rect.h !== refRect.y + refRect.h ? amount : 0) - y;
    return {
        x: rect.x + x,
        y: rect.y + y,
        w: rect.w + w,
        h: rect.h + h,
        radius: rect.radius
    };
}
class BarElement extends Element {
    static id = 'bar';
 static defaults = {
        borderSkipped: 'start',
        borderWidth: 0,
        borderRadius: 0,
        inflateAmount: 'auto',
        pointStyle: undefined
    };
 static defaultRoutes = {
        backgroundColor: 'backgroundColor',
        borderColor: 'borderColor'
    };
    constructor(cfg){
        super();
        this.options = undefined;
        this.horizontal = undefined;
        this.base = undefined;
        this.width = undefined;
        this.height = undefined;
        this.inflateAmount = undefined;
        if (cfg) {
            Object.assign(this, cfg);
        }
    }
    draw(ctx) {
        const { inflateAmount , options: { borderColor , backgroundColor  }  } = this;
        const { inner , outer  } = boundingRects(this);
        const addRectPath = hasRadius(outer.radius) ? _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.au : addNormalRectPath;
        ctx.save();
        if (outer.w !== inner.w || outer.h !== inner.h) {
            ctx.beginPath();
            addRectPath(ctx, inflateRect(outer, inflateAmount, inner));
            ctx.clip();
            addRectPath(ctx, inflateRect(inner, -inflateAmount, outer));
            ctx.fillStyle = borderColor;
            ctx.fill('evenodd');
        }
        ctx.beginPath();
        addRectPath(ctx, inflateRect(inner, inflateAmount));
        ctx.fillStyle = backgroundColor;
        ctx.fill();
        ctx.restore();
    }
    inRange(mouseX, mouseY, useFinalPosition) {
        return inRange(this, mouseX, mouseY, useFinalPosition);
    }
    inXRange(mouseX, useFinalPosition) {
        return inRange(this, mouseX, null, useFinalPosition);
    }
    inYRange(mouseY, useFinalPosition) {
        return inRange(this, null, mouseY, useFinalPosition);
    }
    getCenterPoint(useFinalPosition) {
        const { x , y , base , horizontal  } =  this.getProps([
            'x',
            'y',
            'base',
            'horizontal'
        ], useFinalPosition);
        return {
            x: horizontal ? (x + base) / 2 : x,
            y: horizontal ? y : (y + base) / 2
        };
    }
    getRange(axis) {
        return axis === 'x' ? this.width / 2 : this.height / 2;
    }
}

var elements = /*#__PURE__*/Object.freeze({
__proto__: null,
ArcElement: ArcElement,
BarElement: BarElement,
LineElement: LineElement,
PointElement: PointElement
});

const BORDER_COLORS = [
    'rgb(54, 162, 235)',
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(153, 102, 255)',
    'rgb(201, 203, 207)' // grey
];
// Border colors with 50% transparency
const BACKGROUND_COLORS = /* #__PURE__ */ BORDER_COLORS.map((color)=>color.replace('rgb(', 'rgba(').replace(')', ', 0.5)'));
function getBorderColor(i) {
    return BORDER_COLORS[i % BORDER_COLORS.length];
}
function getBackgroundColor(i) {
    return BACKGROUND_COLORS[i % BACKGROUND_COLORS.length];
}
function colorizeDefaultDataset(dataset, i) {
    dataset.borderColor = getBorderColor(i);
    dataset.backgroundColor = getBackgroundColor(i);
    return ++i;
}
function colorizeDoughnutDataset(dataset, i) {
    dataset.backgroundColor = dataset.data.map(()=>getBorderColor(i++));
    return i;
}
function colorizePolarAreaDataset(dataset, i) {
    dataset.backgroundColor = dataset.data.map(()=>getBackgroundColor(i++));
    return i;
}
function getColorizer(chart) {
    let i = 0;
    return (dataset, datasetIndex)=>{
        const controller = chart.getDatasetMeta(datasetIndex).controller;
        if (controller instanceof DoughnutController) {
            i = colorizeDoughnutDataset(dataset, i);
        } else if (controller instanceof PolarAreaController) {
            i = colorizePolarAreaDataset(dataset, i);
        } else if (controller) {
            i = colorizeDefaultDataset(dataset, i);
        }
    };
}
function containsColorsDefinitions(descriptors) {
    let k;
    for(k in descriptors){
        if (descriptors[k].borderColor || descriptors[k].backgroundColor) {
            return true;
        }
    }
    return false;
}
function containsColorsDefinition(descriptor) {
    return descriptor && (descriptor.borderColor || descriptor.backgroundColor);
}
var plugin_colors = {
    id: 'colors',
    defaults: {
        enabled: true,
        forceOverride: false
    },
    beforeLayout (chart, _args, options) {
        if (!options.enabled) {
            return;
        }
        const { data: { datasets  } , options: chartOptions  } = chart.config;
        const { elements  } = chartOptions;
        if (!options.forceOverride && (containsColorsDefinitions(datasets) || containsColorsDefinition(chartOptions) || elements && containsColorsDefinitions(elements))) {
            return;
        }
        const colorizer = getColorizer(chart);
        datasets.forEach(colorizer);
    }
};

function lttbDecimation(data, start, count, availableWidth, options) {
 const samples = options.samples || availableWidth;
    if (samples >= count) {
        return data.slice(start, start + count);
    }
    const decimated = [];
    const bucketWidth = (count - 2) / (samples - 2);
    let sampledIndex = 0;
    const endIndex = start + count - 1;
    let a = start;
    let i, maxAreaPoint, maxArea, area, nextA;
    decimated[sampledIndex++] = data[a];
    for(i = 0; i < samples - 2; i++){
        let avgX = 0;
        let avgY = 0;
        let j;
        const avgRangeStart = Math.floor((i + 1) * bucketWidth) + 1 + start;
        const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketWidth) + 1, count) + start;
        const avgRangeLength = avgRangeEnd - avgRangeStart;
        for(j = avgRangeStart; j < avgRangeEnd; j++){
            avgX += data[j].x;
            avgY += data[j].y;
        }
        avgX /= avgRangeLength;
        avgY /= avgRangeLength;
        const rangeOffs = Math.floor(i * bucketWidth) + 1 + start;
        const rangeTo = Math.min(Math.floor((i + 1) * bucketWidth) + 1, count) + start;
        const { x: pointAx , y: pointAy  } = data[a];
        maxArea = area = -1;
        for(j = rangeOffs; j < rangeTo; j++){
            area = 0.5 * Math.abs((pointAx - avgX) * (data[j].y - pointAy) - (pointAx - data[j].x) * (avgY - pointAy));
            if (area > maxArea) {
                maxArea = area;
                maxAreaPoint = data[j];
                nextA = j;
            }
        }
        decimated[sampledIndex++] = maxAreaPoint;
        a = nextA;
    }
    decimated[sampledIndex++] = data[endIndex];
    return decimated;
}
function minMaxDecimation(data, start, count, availableWidth) {
    let avgX = 0;
    let countX = 0;
    let i, point, x, y, prevX, minIndex, maxIndex, startIndex, minY, maxY;
    const decimated = [];
    const endIndex = start + count - 1;
    const xMin = data[start].x;
    const xMax = data[endIndex].x;
    const dx = xMax - xMin;
    for(i = start; i < start + count; ++i){
        point = data[i];
        x = (point.x - xMin) / dx * availableWidth;
        y = point.y;
        const truncX = x | 0;
        if (truncX === prevX) {
            if (y < minY) {
                minY = y;
                minIndex = i;
            } else if (y > maxY) {
                maxY = y;
                maxIndex = i;
            }
            avgX = (countX * avgX + point.x) / ++countX;
        } else {
            const lastIndex = i - 1;
            if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(minIndex) && !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(maxIndex)) {
                const intermediateIndex1 = Math.min(minIndex, maxIndex);
                const intermediateIndex2 = Math.max(minIndex, maxIndex);
                if (intermediateIndex1 !== startIndex && intermediateIndex1 !== lastIndex) {
                    decimated.push({
                        ...data[intermediateIndex1],
                        x: avgX
                    });
                }
                if (intermediateIndex2 !== startIndex && intermediateIndex2 !== lastIndex) {
                    decimated.push({
                        ...data[intermediateIndex2],
                        x: avgX
                    });
                }
            }
            if (i > 0 && lastIndex !== startIndex) {
                decimated.push(data[lastIndex]);
            }
            decimated.push(point);
            prevX = truncX;
            countX = 0;
            minY = maxY = y;
            minIndex = maxIndex = startIndex = i;
        }
    }
    return decimated;
}
function cleanDecimatedDataset(dataset) {
    if (dataset._decimated) {
        const data = dataset._data;
        delete dataset._decimated;
        delete dataset._data;
        Object.defineProperty(dataset, 'data', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: data
        });
    }
}
function cleanDecimatedData(chart) {
    chart.data.datasets.forEach((dataset)=>{
        cleanDecimatedDataset(dataset);
    });
}
function getStartAndCountOfVisiblePointsSimplified(meta, points) {
    const pointCount = points.length;
    let start = 0;
    let count;
    const { iScale  } = meta;
    const { min , max , minDefined , maxDefined  } = iScale.getUserBounds();
    if (minDefined) {
        start = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.B)(points, iScale.axis, min).lo, 0, pointCount - 1);
    }
    if (maxDefined) {
        count = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.B)(points, iScale.axis, max).hi + 1, start, pointCount) - start;
    } else {
        count = pointCount - start;
    }
    return {
        start,
        count
    };
}
var plugin_decimation = {
    id: 'decimation',
    defaults: {
        algorithm: 'min-max',
        enabled: false
    },
    beforeElementsUpdate: (chart, args, options)=>{
        if (!options.enabled) {
            cleanDecimatedData(chart);
            return;
        }
        const availableWidth = chart.width;
        chart.data.datasets.forEach((dataset, datasetIndex)=>{
            const { _data , indexAxis  } = dataset;
            const meta = chart.getDatasetMeta(datasetIndex);
            const data = _data || dataset.data;
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a)([
                indexAxis,
                chart.options.indexAxis
            ]) === 'y') {
                return;
            }
            if (!meta.controller.supportsDecimation) {
                return;
            }
            const xAxis = chart.scales[meta.xAxisID];
            if (xAxis.type !== 'linear' && xAxis.type !== 'time') {
                return;
            }
            if (chart.options.parsing) {
                return;
            }
            let { start , count  } = getStartAndCountOfVisiblePointsSimplified(meta, data);
            const threshold = options.threshold || 4 * availableWidth;
            if (count <= threshold) {
                cleanDecimatedDataset(dataset);
                return;
            }
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(_data)) {
                dataset._data = data;
                delete dataset.data;
                Object.defineProperty(dataset, 'data', {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                        return this._decimated;
                    },
                    set: function(d) {
                        this._data = d;
                    }
                });
            }
            let decimated;
            switch(options.algorithm){
                case 'lttb':
                    decimated = lttbDecimation(data, start, count, availableWidth, options);
                    break;
                case 'min-max':
                    decimated = minMaxDecimation(data, start, count, availableWidth);
                    break;
                default:
                    throw new Error(`Unsupported decimation algorithm '${options.algorithm}'`);
            }
            dataset._decimated = decimated;
        });
    },
    destroy (chart) {
        cleanDecimatedData(chart);
    }
};

function _segments(line, target, property) {
    const segments = line.segments;
    const points = line.points;
    const tpoints = target.points;
    const parts = [];
    for (const segment of segments){
        let { start , end  } = segment;
        end = _findSegmentEnd(start, end, points);
        const bounds = _getBounds(property, points[start], points[end], segment.loop);
        if (!target.segments) {
            parts.push({
                source: segment,
                target: bounds,
                start: points[start],
                end: points[end]
            });
            continue;
        }
        const targetSegments = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.an)(target, bounds);
        for (const tgt of targetSegments){
            const subBounds = _getBounds(property, tpoints[tgt.start], tpoints[tgt.end], tgt.loop);
            const fillSources = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ax)(segment, points, subBounds);
            for (const fillSource of fillSources){
                parts.push({
                    source: fillSource,
                    target: tgt,
                    start: {
                        [property]: _getEdge(bounds, subBounds, 'start', Math.max)
                    },
                    end: {
                        [property]: _getEdge(bounds, subBounds, 'end', Math.min)
                    }
                });
            }
        }
    }
    return parts;
}
function _getBounds(property, first, last, loop) {
    if (loop) {
        return;
    }
    let start = first[property];
    let end = last[property];
    if (property === 'angle') {
        start = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ay)(start);
        end = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ay)(end);
    }
    return {
        property,
        start,
        end
    };
}
function _pointsFromSegments(boundary, line) {
    const { x =null , y =null  } = boundary || {};
    const linePoints = line.points;
    const points = [];
    line.segments.forEach(({ start , end  })=>{
        end = _findSegmentEnd(start, end, linePoints);
        const first = linePoints[start];
        const last = linePoints[end];
        if (y !== null) {
            points.push({
                x: first.x,
                y
            });
            points.push({
                x: last.x,
                y
            });
        } else if (x !== null) {
            points.push({
                x,
                y: first.y
            });
            points.push({
                x,
                y: last.y
            });
        }
    });
    return points;
}
function _findSegmentEnd(start, end, points) {
    for(; end > start; end--){
        const point = points[end];
        if (!isNaN(point.x) && !isNaN(point.y)) {
            break;
        }
    }
    return end;
}
function _getEdge(a, b, prop, fn) {
    if (a && b) {
        return fn(a[prop], b[prop]);
    }
    return a ? a[prop] : b ? b[prop] : 0;
}

function _createBoundaryLine(boundary, line) {
    let points = [];
    let _loop = false;
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(boundary)) {
        _loop = true;
        points = boundary;
    } else {
        points = _pointsFromSegments(boundary, line);
    }
    return points.length ? new LineElement({
        points,
        options: {
            tension: 0
        },
        _loop,
        _fullLoop: _loop
    }) : null;
}
function _shouldApplyFill(source) {
    return source && source.fill !== false;
}

function _resolveTarget(sources, index, propagate) {
    const source = sources[index];
    let fill = source.fill;
    const visited = [
        index
    ];
    let target;
    if (!propagate) {
        return fill;
    }
    while(fill !== false && visited.indexOf(fill) === -1){
        if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(fill)) {
            return fill;
        }
        target = sources[fill];
        if (!target) {
            return false;
        }
        if (target.visible) {
            return fill;
        }
        visited.push(fill);
        fill = target.fill;
    }
    return false;
}
 function _decodeFill(line, index, count) {
     const fill = parseFillOption(line);
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(fill)) {
        return isNaN(fill.value) ? false : fill;
    }
    let target = parseFloat(fill);
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(target) && Math.floor(target) === target) {
        return decodeTargetIndex(fill[0], index, target, count);
    }
    return [
        'origin',
        'start',
        'end',
        'stack',
        'shape'
    ].indexOf(fill) >= 0 && fill;
}
function decodeTargetIndex(firstCh, index, target, count) {
    if (firstCh === '-' || firstCh === '+') {
        target = index + target;
    }
    if (target === index || target < 0 || target >= count) {
        return false;
    }
    return target;
}
 function _getTargetPixel(fill, scale) {
    let pixel = null;
    if (fill === 'start') {
        pixel = scale.bottom;
    } else if (fill === 'end') {
        pixel = scale.top;
    } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(fill)) {
        pixel = scale.getPixelForValue(fill.value);
    } else if (scale.getBasePixel) {
        pixel = scale.getBasePixel();
    }
    return pixel;
}
 function _getTargetValue(fill, scale, startValue) {
    let value;
    if (fill === 'start') {
        value = startValue;
    } else if (fill === 'end') {
        value = scale.options.reverse ? scale.min : scale.max;
    } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(fill)) {
        value = fill.value;
    } else {
        value = scale.getBaseValue();
    }
    return value;
}
 function parseFillOption(line) {
    const options = line.options;
    const fillOption = options.fill;
    let fill = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(fillOption && fillOption.target, fillOption);
    if (fill === undefined) {
        fill = !!options.backgroundColor;
    }
    if (fill === false || fill === null) {
        return false;
    }
    if (fill === true) {
        return 'origin';
    }
    return fill;
}

function _buildStackLine(source) {
    const { scale , index , line  } = source;
    const points = [];
    const segments = line.segments;
    const sourcePoints = line.points;
    const linesBelow = getLinesBelow(scale, index);
    linesBelow.push(_createBoundaryLine({
        x: null,
        y: scale.bottom
    }, line));
    for(let i = 0; i < segments.length; i++){
        const segment = segments[i];
        for(let j = segment.start; j <= segment.end; j++){
            addPointsBelow(points, sourcePoints[j], linesBelow);
        }
    }
    return new LineElement({
        points,
        options: {}
    });
}
 function getLinesBelow(scale, index) {
    const below = [];
    const metas = scale.getMatchingVisibleMetas('line');
    for(let i = 0; i < metas.length; i++){
        const meta = metas[i];
        if (meta.index === index) {
            break;
        }
        if (!meta.hidden) {
            below.unshift(meta.dataset);
        }
    }
    return below;
}
 function addPointsBelow(points, sourcePoint, linesBelow) {
    const postponed = [];
    for(let j = 0; j < linesBelow.length; j++){
        const line = linesBelow[j];
        const { first , last , point  } = findPoint(line, sourcePoint, 'x');
        if (!point || first && last) {
            continue;
        }
        if (first) {
            postponed.unshift(point);
        } else {
            points.push(point);
            if (!last) {
                break;
            }
        }
    }
    points.push(...postponed);
}
 function findPoint(line, sourcePoint, property) {
    const point = line.interpolate(sourcePoint, property);
    if (!point) {
        return {};
    }
    const pointValue = point[property];
    const segments = line.segments;
    const linePoints = line.points;
    let first = false;
    let last = false;
    for(let i = 0; i < segments.length; i++){
        const segment = segments[i];
        const firstValue = linePoints[segment.start][property];
        const lastValue = linePoints[segment.end][property];
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(pointValue, firstValue, lastValue)) {
            first = pointValue === firstValue;
            last = pointValue === lastValue;
            break;
        }
    }
    return {
        first,
        last,
        point
    };
}

class simpleArc {
    constructor(opts){
        this.x = opts.x;
        this.y = opts.y;
        this.radius = opts.radius;
    }
    pathSegment(ctx, bounds, opts) {
        const { x , y , radius  } = this;
        bounds = bounds || {
            start: 0,
            end: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T
        };
        ctx.arc(x, y, radius, bounds.end, bounds.start, true);
        return !opts.bounds;
    }
    interpolate(point) {
        const { x , y , radius  } = this;
        const angle = point.angle;
        return {
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
            angle
        };
    }
}

function _getTarget(source) {
    const { chart , fill , line  } = source;
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(fill)) {
        return getLineByIndex(chart, fill);
    }
    if (fill === 'stack') {
        return _buildStackLine(source);
    }
    if (fill === 'shape') {
        return true;
    }
    const boundary = computeBoundary(source);
    if (boundary instanceof simpleArc) {
        return boundary;
    }
    return _createBoundaryLine(boundary, line);
}
 function getLineByIndex(chart, index) {
    const meta = chart.getDatasetMeta(index);
    const visible = meta && chart.isDatasetVisible(index);
    return visible ? meta.dataset : null;
}
function computeBoundary(source) {
    const scale = source.scale || {};
    if (scale.getPointPositionForValue) {
        return computeCircularBoundary(source);
    }
    return computeLinearBoundary(source);
}
function computeLinearBoundary(source) {
    const { scale ={} , fill  } = source;
    const pixel = _getTargetPixel(fill, scale);
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(pixel)) {
        const horizontal = scale.isHorizontal();
        return {
            x: horizontal ? pixel : null,
            y: horizontal ? null : pixel
        };
    }
    return null;
}
function computeCircularBoundary(source) {
    const { scale , fill  } = source;
    const options = scale.options;
    const length = scale.getLabels().length;
    const start = options.reverse ? scale.max : scale.min;
    const value = _getTargetValue(fill, scale, start);
    const target = [];
    if (options.grid.circular) {
        const center = scale.getPointPositionForValue(0, start);
        return new simpleArc({
            x: center.x,
            y: center.y,
            radius: scale.getDistanceFromCenterForValue(value)
        });
    }
    for(let i = 0; i < length; ++i){
        target.push(scale.getPointPositionForValue(i, value));
    }
    return target;
}

function _drawfill(ctx, source, area) {
    const target = _getTarget(source);
    const { line , scale , axis  } = source;
    const lineOpts = line.options;
    const fillOption = lineOpts.fill;
    const color = lineOpts.backgroundColor;
    const { above =color , below =color  } = fillOption || {};
    if (target && line.points.length) {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Y)(ctx, area);
        doFill(ctx, {
            line,
            target,
            above,
            below,
            area,
            scale,
            axis
        });
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.$)(ctx);
    }
}
function doFill(ctx, cfg) {
    const { line , target , above , below , area , scale  } = cfg;
    const property = line._loop ? 'angle' : cfg.axis;
    ctx.save();
    if (property === 'x' && below !== above) {
        clipVertical(ctx, target, area.top);
        fill(ctx, {
            line,
            target,
            color: above,
            scale,
            property
        });
        ctx.restore();
        ctx.save();
        clipVertical(ctx, target, area.bottom);
    }
    fill(ctx, {
        line,
        target,
        color: below,
        scale,
        property
    });
    ctx.restore();
}
function clipVertical(ctx, target, clipY) {
    const { segments , points  } = target;
    let first = true;
    let lineLoop = false;
    ctx.beginPath();
    for (const segment of segments){
        const { start , end  } = segment;
        const firstPoint = points[start];
        const lastPoint = points[_findSegmentEnd(start, end, points)];
        if (first) {
            ctx.moveTo(firstPoint.x, firstPoint.y);
            first = false;
        } else {
            ctx.lineTo(firstPoint.x, clipY);
            ctx.lineTo(firstPoint.x, firstPoint.y);
        }
        lineLoop = !!target.pathSegment(ctx, segment, {
            move: lineLoop
        });
        if (lineLoop) {
            ctx.closePath();
        } else {
            ctx.lineTo(lastPoint.x, clipY);
        }
    }
    ctx.lineTo(target.first().x, clipY);
    ctx.closePath();
    ctx.clip();
}
function fill(ctx, cfg) {
    const { line , target , property , color , scale  } = cfg;
    const segments = _segments(line, target, property);
    for (const { source: src , target: tgt , start , end  } of segments){
        const { style: { backgroundColor =color  } = {}  } = src;
        const notShape = target !== true;
        ctx.save();
        ctx.fillStyle = backgroundColor;
        clipBounds(ctx, scale, notShape && _getBounds(property, start, end));
        ctx.beginPath();
        const lineLoop = !!line.pathSegment(ctx, src);
        let loop;
        if (notShape) {
            if (lineLoop) {
                ctx.closePath();
            } else {
                interpolatedLineTo(ctx, target, end, property);
            }
            const targetLoop = !!target.pathSegment(ctx, tgt, {
                move: lineLoop,
                reverse: true
            });
            loop = lineLoop && targetLoop;
            if (!loop) {
                interpolatedLineTo(ctx, target, start, property);
            }
        }
        ctx.closePath();
        ctx.fill(loop ? 'evenodd' : 'nonzero');
        ctx.restore();
    }
}
function clipBounds(ctx, scale, bounds) {
    const { top , bottom  } = scale.chart.chartArea;
    const { property , start , end  } = bounds || {};
    if (property === 'x') {
        ctx.beginPath();
        ctx.rect(start, top, end - start, bottom - top);
        ctx.clip();
    }
}
function interpolatedLineTo(ctx, target, point, property) {
    const interpolatedPoint = target.interpolate(point, property);
    if (interpolatedPoint) {
        ctx.lineTo(interpolatedPoint.x, interpolatedPoint.y);
    }
}

var index = {
    id: 'filler',
    afterDatasetsUpdate (chart, _args, options) {
        const count = (chart.data.datasets || []).length;
        const sources = [];
        let meta, i, line, source;
        for(i = 0; i < count; ++i){
            meta = chart.getDatasetMeta(i);
            line = meta.dataset;
            source = null;
            if (line && line.options && line instanceof LineElement) {
                source = {
                    visible: chart.isDatasetVisible(i),
                    index: i,
                    fill: _decodeFill(line, i, count),
                    chart,
                    axis: meta.controller.options.indexAxis,
                    scale: meta.vScale,
                    line
                };
            }
            meta.$filler = source;
            sources.push(source);
        }
        for(i = 0; i < count; ++i){
            source = sources[i];
            if (!source || source.fill === false) {
                continue;
            }
            source.fill = _resolveTarget(sources, i, options.propagate);
        }
    },
    beforeDraw (chart, _args, options) {
        const draw = options.drawTime === 'beforeDraw';
        const metasets = chart.getSortedVisibleDatasetMetas();
        const area = chart.chartArea;
        for(let i = metasets.length - 1; i >= 0; --i){
            const source = metasets[i].$filler;
            if (!source) {
                continue;
            }
            source.line.updateControlPoints(area, source.axis);
            if (draw && source.fill) {
                _drawfill(chart.ctx, source, area);
            }
        }
    },
    beforeDatasetsDraw (chart, _args, options) {
        if (options.drawTime !== 'beforeDatasetsDraw') {
            return;
        }
        const metasets = chart.getSortedVisibleDatasetMetas();
        for(let i = metasets.length - 1; i >= 0; --i){
            const source = metasets[i].$filler;
            if (_shouldApplyFill(source)) {
                _drawfill(chart.ctx, source, chart.chartArea);
            }
        }
    },
    beforeDatasetDraw (chart, args, options) {
        const source = args.meta.$filler;
        if (!_shouldApplyFill(source) || options.drawTime !== 'beforeDatasetDraw') {
            return;
        }
        _drawfill(chart.ctx, source, chart.chartArea);
    },
    defaults: {
        propagate: true,
        drawTime: 'beforeDatasetDraw'
    }
};

const getBoxSize = (labelOpts, fontSize)=>{
    let { boxHeight =fontSize , boxWidth =fontSize  } = labelOpts;
    if (labelOpts.usePointStyle) {
        boxHeight = Math.min(boxHeight, fontSize);
        boxWidth = labelOpts.pointStyleWidth || Math.min(boxWidth, fontSize);
    }
    return {
        boxWidth,
        boxHeight,
        itemHeight: Math.max(fontSize, boxHeight)
    };
};
const itemsEqual = (a, b)=>a !== null && b !== null && a.datasetIndex === b.datasetIndex && a.index === b.index;
class Legend extends Element {
 constructor(config){
        super();
        this._added = false;
        this.legendHitBoxes = [];
 this._hoveredItem = null;
        this.doughnutMode = false;
        this.chart = config.chart;
        this.options = config.options;
        this.ctx = config.ctx;
        this.legendItems = undefined;
        this.columnSizes = undefined;
        this.lineWidths = undefined;
        this.maxHeight = undefined;
        this.maxWidth = undefined;
        this.top = undefined;
        this.bottom = undefined;
        this.left = undefined;
        this.right = undefined;
        this.height = undefined;
        this.width = undefined;
        this._margins = undefined;
        this.position = undefined;
        this.weight = undefined;
        this.fullSize = undefined;
    }
    update(maxWidth, maxHeight, margins) {
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this._margins = margins;
        this.setDimensions();
        this.buildLabels();
        this.fit();
    }
    setDimensions() {
        if (this.isHorizontal()) {
            this.width = this.maxWidth;
            this.left = this._margins.left;
            this.right = this.width;
        } else {
            this.height = this.maxHeight;
            this.top = this._margins.top;
            this.bottom = this.height;
        }
    }
    buildLabels() {
        const labelOpts = this.options.labels || {};
        let legendItems = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(labelOpts.generateLabels, [
            this.chart
        ], this) || [];
        if (labelOpts.filter) {
            legendItems = legendItems.filter((item)=>labelOpts.filter(item, this.chart.data));
        }
        if (labelOpts.sort) {
            legendItems = legendItems.sort((a, b)=>labelOpts.sort(a, b, this.chart.data));
        }
        if (this.options.reverse) {
            legendItems.reverse();
        }
        this.legendItems = legendItems;
    }
    fit() {
        const { options , ctx  } = this;
        if (!options.display) {
            this.width = this.height = 0;
            return;
        }
        const labelOpts = options.labels;
        const labelFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(labelOpts.font);
        const fontSize = labelFont.size;
        const titleHeight = this._computeTitleHeight();
        const { boxWidth , itemHeight  } = getBoxSize(labelOpts, fontSize);
        let width, height;
        ctx.font = labelFont.string;
        if (this.isHorizontal()) {
            width = this.maxWidth;
            height = this._fitRows(titleHeight, fontSize, boxWidth, itemHeight) + 10;
        } else {
            height = this.maxHeight;
            width = this._fitCols(titleHeight, labelFont, boxWidth, itemHeight) + 10;
        }
        this.width = Math.min(width, options.maxWidth || this.maxWidth);
        this.height = Math.min(height, options.maxHeight || this.maxHeight);
    }
 _fitRows(titleHeight, fontSize, boxWidth, itemHeight) {
        const { ctx , maxWidth , options: { labels: { padding  }  }  } = this;
        const hitboxes = this.legendHitBoxes = [];
        const lineWidths = this.lineWidths = [
            0
        ];
        const lineHeight = itemHeight + padding;
        let totalHeight = titleHeight;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        let row = -1;
        let top = -lineHeight;
        this.legendItems.forEach((legendItem, i)=>{
            const itemWidth = boxWidth + fontSize / 2 + ctx.measureText(legendItem.text).width;
            if (i === 0 || lineWidths[lineWidths.length - 1] + itemWidth + 2 * padding > maxWidth) {
                totalHeight += lineHeight;
                lineWidths[lineWidths.length - (i > 0 ? 0 : 1)] = 0;
                top += lineHeight;
                row++;
            }
            hitboxes[i] = {
                left: 0,
                top,
                row,
                width: itemWidth,
                height: itemHeight
            };
            lineWidths[lineWidths.length - 1] += itemWidth + padding;
        });
        return totalHeight;
    }
    _fitCols(titleHeight, labelFont, boxWidth, _itemHeight) {
        const { ctx , maxHeight , options: { labels: { padding  }  }  } = this;
        const hitboxes = this.legendHitBoxes = [];
        const columnSizes = this.columnSizes = [];
        const heightLimit = maxHeight - titleHeight;
        let totalWidth = padding;
        let currentColWidth = 0;
        let currentColHeight = 0;
        let left = 0;
        let col = 0;
        this.legendItems.forEach((legendItem, i)=>{
            const { itemWidth , itemHeight  } = calculateItemSize(boxWidth, labelFont, ctx, legendItem, _itemHeight);
            if (i > 0 && currentColHeight + itemHeight + 2 * padding > heightLimit) {
                totalWidth += currentColWidth + padding;
                columnSizes.push({
                    width: currentColWidth,
                    height: currentColHeight
                });
                left += currentColWidth + padding;
                col++;
                currentColWidth = currentColHeight = 0;
            }
            hitboxes[i] = {
                left,
                top: currentColHeight,
                col,
                width: itemWidth,
                height: itemHeight
            };
            currentColWidth = Math.max(currentColWidth, itemWidth);
            currentColHeight += itemHeight + padding;
        });
        totalWidth += currentColWidth;
        columnSizes.push({
            width: currentColWidth,
            height: currentColHeight
        });
        return totalWidth;
    }
    adjustHitBoxes() {
        if (!this.options.display) {
            return;
        }
        const titleHeight = this._computeTitleHeight();
        const { legendHitBoxes: hitboxes , options: { align , labels: { padding  } , rtl  }  } = this;
        const rtlHelper = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az)(rtl, this.left, this.width);
        if (this.isHorizontal()) {
            let row = 0;
            let left = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.left + padding, this.right - this.lineWidths[row]);
            for (const hitbox of hitboxes){
                if (row !== hitbox.row) {
                    row = hitbox.row;
                    left = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.left + padding, this.right - this.lineWidths[row]);
                }
                hitbox.top += this.top + titleHeight + padding;
                hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(left), hitbox.width);
                left += hitbox.width + padding;
            }
        } else {
            let col = 0;
            let top = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
            for (const hitbox of hitboxes){
                if (hitbox.col !== col) {
                    col = hitbox.col;
                    top = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
                }
                hitbox.top = top;
                hitbox.left += this.left + padding;
                hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(hitbox.left), hitbox.width);
                top += hitbox.height + padding;
            }
        }
    }
    isHorizontal() {
        return this.options.position === 'top' || this.options.position === 'bottom';
    }
    draw() {
        if (this.options.display) {
            const ctx = this.ctx;
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Y)(ctx, this);
            this._draw();
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.$)(ctx);
        }
    }
 _draw() {
        const { options: opts , columnSizes , lineWidths , ctx  } = this;
        const { align , labels: labelOpts  } = opts;
        const defaultColor = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.color;
        const rtlHelper = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az)(opts.rtl, this.left, this.width);
        const labelFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(labelOpts.font);
        const { padding  } = labelOpts;
        const fontSize = labelFont.size;
        const halfFontSize = fontSize / 2;
        let cursor;
        this.drawTitle();
        ctx.textAlign = rtlHelper.textAlign('left');
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 0.5;
        ctx.font = labelFont.string;
        const { boxWidth , boxHeight , itemHeight  } = getBoxSize(labelOpts, fontSize);
        const drawLegendBox = function(x, y, legendItem) {
            if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) {
                return;
            }
            ctx.save();
            const lineWidth = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.lineWidth, 1);
            ctx.fillStyle = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.fillStyle, defaultColor);
            ctx.lineCap = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.lineCap, 'butt');
            ctx.lineDashOffset = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.lineDashOffset, 0);
            ctx.lineJoin = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.lineJoin, 'miter');
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.strokeStyle, defaultColor);
            ctx.setLineDash((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.lineDash, []));
            if (labelOpts.usePointStyle) {
                const drawOptions = {
                    radius: boxHeight * Math.SQRT2 / 2,
                    pointStyle: legendItem.pointStyle,
                    rotation: legendItem.rotation,
                    borderWidth: lineWidth
                };
                const centerX = rtlHelper.xPlus(x, boxWidth / 2);
                const centerY = y + halfFontSize;
                (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aD)(ctx, drawOptions, centerX, centerY, labelOpts.pointStyleWidth && boxWidth);
            } else {
                const yBoxTop = y + Math.max((fontSize - boxHeight) / 2, 0);
                const xBoxLeft = rtlHelper.leftForLtr(x, boxWidth);
                const borderRadius = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(legendItem.borderRadius);
                ctx.beginPath();
                if (Object.values(borderRadius).some((v)=>v !== 0)) {
                    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.au)(ctx, {
                        x: xBoxLeft,
                        y: yBoxTop,
                        w: boxWidth,
                        h: boxHeight,
                        radius: borderRadius
                    });
                } else {
                    ctx.rect(xBoxLeft, yBoxTop, boxWidth, boxHeight);
                }
                ctx.fill();
                if (lineWidth !== 0) {
                    ctx.stroke();
                }
            }
            ctx.restore();
        };
        const fillText = function(x, y, legendItem) {
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, legendItem.text, x, y + itemHeight / 2, labelFont, {
                strikethrough: legendItem.hidden,
                textAlign: rtlHelper.textAlign(legendItem.textAlign)
            });
        };
        const isHorizontal = this.isHorizontal();
        const titleHeight = this._computeTitleHeight();
        if (isHorizontal) {
            cursor = {
                x: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.left + padding, this.right - lineWidths[0]),
                y: this.top + padding + titleHeight,
                line: 0
            };
        } else {
            cursor = {
                x: this.left + padding,
                y: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.top + titleHeight + padding, this.bottom - columnSizes[0].height),
                line: 0
            };
        }
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aA)(this.ctx, opts.textDirection);
        const lineHeight = itemHeight + padding;
        this.legendItems.forEach((legendItem, i)=>{
            ctx.strokeStyle = legendItem.fontColor;
            ctx.fillStyle = legendItem.fontColor;
            const textWidth = ctx.measureText(legendItem.text).width;
            const textAlign = rtlHelper.textAlign(legendItem.textAlign || (legendItem.textAlign = labelOpts.textAlign));
            const width = boxWidth + halfFontSize + textWidth;
            let x = cursor.x;
            let y = cursor.y;
            rtlHelper.setWidth(this.width);
            if (isHorizontal) {
                if (i > 0 && x + width + padding > this.right) {
                    y = cursor.y += lineHeight;
                    cursor.line++;
                    x = cursor.x = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.left + padding, this.right - lineWidths[cursor.line]);
                }
            } else if (i > 0 && y + lineHeight > this.bottom) {
                x = cursor.x = x + columnSizes[cursor.line].width + padding;
                cursor.line++;
                y = cursor.y = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.top + titleHeight + padding, this.bottom - columnSizes[cursor.line].height);
            }
            const realX = rtlHelper.x(x);
            drawLegendBox(realX, y, legendItem);
            x = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aB)(textAlign, x + boxWidth + halfFontSize, isHorizontal ? x + width : this.right, opts.rtl);
            fillText(rtlHelper.x(x), y, legendItem);
            if (isHorizontal) {
                cursor.x += width + padding;
            } else if (typeof legendItem.text !== 'string') {
                const fontLineHeight = labelFont.lineHeight;
                cursor.y += calculateLegendItemHeight(legendItem, fontLineHeight) + padding;
            } else {
                cursor.y += lineHeight;
            }
        });
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aC)(this.ctx, opts.textDirection);
    }
 drawTitle() {
        const opts = this.options;
        const titleOpts = opts.title;
        const titleFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(titleOpts.font);
        const titlePadding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(titleOpts.padding);
        if (!titleOpts.display) {
            return;
        }
        const rtlHelper = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az)(opts.rtl, this.left, this.width);
        const ctx = this.ctx;
        const position = titleOpts.position;
        const halfFontSize = titleFont.size / 2;
        const topPaddingPlusHalfFontSize = titlePadding.top + halfFontSize;
        let y;
        let left = this.left;
        let maxWidth = this.width;
        if (this.isHorizontal()) {
            maxWidth = Math.max(...this.lineWidths);
            y = this.top + topPaddingPlusHalfFontSize;
            left = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(opts.align, left, this.right - maxWidth);
        } else {
            const maxHeight = this.columnSizes.reduce((acc, size)=>Math.max(acc, size.height), 0);
            y = topPaddingPlusHalfFontSize + (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(opts.align, this.top, this.bottom - maxHeight - opts.labels.padding - this._computeTitleHeight());
        }
        const x = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(position, left, left + maxWidth);
        ctx.textAlign = rtlHelper.textAlign((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a1)(position));
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = titleOpts.color;
        ctx.fillStyle = titleOpts.color;
        ctx.font = titleFont.string;
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, titleOpts.text, x, y, titleFont);
    }
 _computeTitleHeight() {
        const titleOpts = this.options.title;
        const titleFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(titleOpts.font);
        const titlePadding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(titleOpts.padding);
        return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
    }
 _getLegendItemAt(x, y) {
        let i, hitBox, lh;
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(x, this.left, this.right) && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(y, this.top, this.bottom)) {
            lh = this.legendHitBoxes;
            for(i = 0; i < lh.length; ++i){
                hitBox = lh[i];
                if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(x, hitBox.left, hitBox.left + hitBox.width) && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(y, hitBox.top, hitBox.top + hitBox.height)) {
                    return this.legendItems[i];
                }
            }
        }
        return null;
    }
 handleEvent(e) {
        const opts = this.options;
        if (!isListened(e.type, opts)) {
            return;
        }
        const hoveredItem = this._getLegendItemAt(e.x, e.y);
        if (e.type === 'mousemove' || e.type === 'mouseout') {
            const previous = this._hoveredItem;
            const sameItem = itemsEqual(previous, hoveredItem);
            if (previous && !sameItem) {
                (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(opts.onLeave, [
                    e,
                    previous,
                    this
                ], this);
            }
            this._hoveredItem = hoveredItem;
            if (hoveredItem && !sameItem) {
                (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(opts.onHover, [
                    e,
                    hoveredItem,
                    this
                ], this);
            }
        } else if (hoveredItem) {
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(opts.onClick, [
                e,
                hoveredItem,
                this
            ], this);
        }
    }
}
function calculateItemSize(boxWidth, labelFont, ctx, legendItem, _itemHeight) {
    const itemWidth = calculateItemWidth(legendItem, boxWidth, labelFont, ctx);
    const itemHeight = calculateItemHeight(_itemHeight, legendItem, labelFont.lineHeight);
    return {
        itemWidth,
        itemHeight
    };
}
function calculateItemWidth(legendItem, boxWidth, labelFont, ctx) {
    let legendItemText = legendItem.text;
    if (legendItemText && typeof legendItemText !== 'string') {
        legendItemText = legendItemText.reduce((a, b)=>a.length > b.length ? a : b);
    }
    return boxWidth + labelFont.size / 2 + ctx.measureText(legendItemText).width;
}
function calculateItemHeight(_itemHeight, legendItem, fontLineHeight) {
    let itemHeight = _itemHeight;
    if (typeof legendItem.text !== 'string') {
        itemHeight = calculateLegendItemHeight(legendItem, fontLineHeight);
    }
    return itemHeight;
}
function calculateLegendItemHeight(legendItem, fontLineHeight) {
    const labelHeight = legendItem.text ? legendItem.text.length : 0;
    return fontLineHeight * labelHeight;
}
function isListened(type, opts) {
    if ((type === 'mousemove' || type === 'mouseout') && (opts.onHover || opts.onLeave)) {
        return true;
    }
    if (opts.onClick && (type === 'click' || type === 'mouseup')) {
        return true;
    }
    return false;
}
var plugin_legend = {
    id: 'legend',
 _element: Legend,
    start (chart, _args, options) {
        const legend = chart.legend = new Legend({
            ctx: chart.ctx,
            options,
            chart
        });
        layouts.configure(chart, legend, options);
        layouts.addBox(chart, legend);
    },
    stop (chart) {
        layouts.removeBox(chart, chart.legend);
        delete chart.legend;
    },
    beforeUpdate (chart, _args, options) {
        const legend = chart.legend;
        layouts.configure(chart, legend, options);
        legend.options = options;
    },
    afterUpdate (chart) {
        const legend = chart.legend;
        legend.buildLabels();
        legend.adjustHitBoxes();
    },
    afterEvent (chart, args) {
        if (!args.replay) {
            chart.legend.handleEvent(args.event);
        }
    },
    defaults: {
        display: true,
        position: 'top',
        align: 'center',
        fullSize: true,
        reverse: false,
        weight: 1000,
        onClick (e, legendItem, legend) {
            const index = legendItem.datasetIndex;
            const ci = legend.chart;
            if (ci.isDatasetVisible(index)) {
                ci.hide(index);
                legendItem.hidden = true;
            } else {
                ci.show(index);
                legendItem.hidden = false;
            }
        },
        onHover: null,
        onLeave: null,
        labels: {
            color: (ctx)=>ctx.chart.options.color,
            boxWidth: 40,
            padding: 10,
            generateLabels (chart) {
                const datasets = chart.data.datasets;
                const { labels: { usePointStyle , pointStyle , textAlign , color , useBorderRadius , borderRadius  }  } = chart.legend.options;
                return chart._getSortedDatasetMetas().map((meta)=>{
                    const style = meta.controller.getStyle(usePointStyle ? 0 : undefined);
                    const borderWidth = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(style.borderWidth);
                    return {
                        text: datasets[meta.index].label,
                        fillStyle: style.backgroundColor,
                        fontColor: color,
                        hidden: !meta.visible,
                        lineCap: style.borderCapStyle,
                        lineDash: style.borderDash,
                        lineDashOffset: style.borderDashOffset,
                        lineJoin: style.borderJoinStyle,
                        lineWidth: (borderWidth.width + borderWidth.height) / 4,
                        strokeStyle: style.borderColor,
                        pointStyle: pointStyle || style.pointStyle,
                        rotation: style.rotation,
                        textAlign: textAlign || style.textAlign,
                        borderRadius: useBorderRadius && (borderRadius || style.borderRadius),
                        datasetIndex: meta.index
                    };
                }, this);
            }
        },
        title: {
            color: (ctx)=>ctx.chart.options.color,
            display: false,
            position: 'center',
            text: ''
        }
    },
    descriptors: {
        _scriptable: (name)=>!name.startsWith('on'),
        labels: {
            _scriptable: (name)=>![
                    'generateLabels',
                    'filter',
                    'sort'
                ].includes(name)
        }
    }
};

class Title extends Element {
 constructor(config){
        super();
        this.chart = config.chart;
        this.options = config.options;
        this.ctx = config.ctx;
        this._padding = undefined;
        this.top = undefined;
        this.bottom = undefined;
        this.left = undefined;
        this.right = undefined;
        this.width = undefined;
        this.height = undefined;
        this.position = undefined;
        this.weight = undefined;
        this.fullSize = undefined;
    }
    update(maxWidth, maxHeight) {
        const opts = this.options;
        this.left = 0;
        this.top = 0;
        if (!opts.display) {
            this.width = this.height = this.right = this.bottom = 0;
            return;
        }
        this.width = this.right = maxWidth;
        this.height = this.bottom = maxHeight;
        const lineCount = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(opts.text) ? opts.text.length : 1;
        this._padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(opts.padding);
        const textSize = lineCount * (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(opts.font).lineHeight + this._padding.height;
        if (this.isHorizontal()) {
            this.height = textSize;
        } else {
            this.width = textSize;
        }
    }
    isHorizontal() {
        const pos = this.options.position;
        return pos === 'top' || pos === 'bottom';
    }
    _drawArgs(offset) {
        const { top , left , bottom , right , options  } = this;
        const align = options.align;
        let rotation = 0;
        let maxWidth, titleX, titleY;
        if (this.isHorizontal()) {
            titleX = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, left, right);
            titleY = top + offset;
            maxWidth = right - left;
        } else {
            if (options.position === 'left') {
                titleX = left + offset;
                titleY = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, bottom, top);
                rotation = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P * -0.5;
            } else {
                titleX = right - offset;
                titleY = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, top, bottom);
                rotation = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P * 0.5;
            }
            maxWidth = bottom - top;
        }
        return {
            titleX,
            titleY,
            maxWidth,
            rotation
        };
    }
    draw() {
        const ctx = this.ctx;
        const opts = this.options;
        if (!opts.display) {
            return;
        }
        const fontOpts = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(opts.font);
        const lineHeight = fontOpts.lineHeight;
        const offset = lineHeight / 2 + this._padding.top;
        const { titleX , titleY , maxWidth , rotation  } = this._drawArgs(offset);
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, opts.text, 0, 0, fontOpts, {
            color: opts.color,
            maxWidth,
            rotation,
            textAlign: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a1)(opts.align),
            textBaseline: 'middle',
            translation: [
                titleX,
                titleY
            ]
        });
    }
}
function createTitle(chart, titleOpts) {
    const title = new Title({
        ctx: chart.ctx,
        options: titleOpts,
        chart
    });
    layouts.configure(chart, title, titleOpts);
    layouts.addBox(chart, title);
    chart.titleBlock = title;
}
var plugin_title = {
    id: 'title',
 _element: Title,
    start (chart, _args, options) {
        createTitle(chart, options);
    },
    stop (chart) {
        const titleBlock = chart.titleBlock;
        layouts.removeBox(chart, titleBlock);
        delete chart.titleBlock;
    },
    beforeUpdate (chart, _args, options) {
        const title = chart.titleBlock;
        layouts.configure(chart, title, options);
        title.options = options;
    },
    defaults: {
        align: 'center',
        display: false,
        font: {
            weight: 'bold'
        },
        fullSize: true,
        padding: 10,
        position: 'top',
        text: '',
        weight: 2000
    },
    defaultRoutes: {
        color: 'color'
    },
    descriptors: {
        _scriptable: true,
        _indexable: false
    }
};

const map = new WeakMap();
var plugin_subtitle = {
    id: 'subtitle',
    start (chart, _args, options) {
        const title = new Title({
            ctx: chart.ctx,
            options,
            chart
        });
        layouts.configure(chart, title, options);
        layouts.addBox(chart, title);
        map.set(chart, title);
    },
    stop (chart) {
        layouts.removeBox(chart, map.get(chart));
        map.delete(chart);
    },
    beforeUpdate (chart, _args, options) {
        const title = map.get(chart);
        layouts.configure(chart, title, options);
        title.options = options;
    },
    defaults: {
        align: 'center',
        display: false,
        font: {
            weight: 'normal'
        },
        fullSize: true,
        padding: 0,
        position: 'top',
        text: '',
        weight: 1500
    },
    defaultRoutes: {
        color: 'color'
    },
    descriptors: {
        _scriptable: true,
        _indexable: false
    }
};

const positioners = {
 average (items) {
        if (!items.length) {
            return false;
        }
        let i, len;
        let x = 0;
        let y = 0;
        let count = 0;
        for(i = 0, len = items.length; i < len; ++i){
            const el = items[i].element;
            if (el && el.hasValue()) {
                const pos = el.tooltipPosition();
                x += pos.x;
                y += pos.y;
                ++count;
            }
        }
        return {
            x: x / count,
            y: y / count
        };
    },
 nearest (items, eventPosition) {
        if (!items.length) {
            return false;
        }
        let x = eventPosition.x;
        let y = eventPosition.y;
        let minDistance = Number.POSITIVE_INFINITY;
        let i, len, nearestElement;
        for(i = 0, len = items.length; i < len; ++i){
            const el = items[i].element;
            if (el && el.hasValue()) {
                const center = el.getCenterPoint();
                const d = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aE)(eventPosition, center);
                if (d < minDistance) {
                    minDistance = d;
                    nearestElement = el;
                }
            }
        }
        if (nearestElement) {
            const tp = nearestElement.tooltipPosition();
            x = tp.x;
            y = tp.y;
        }
        return {
            x,
            y
        };
    }
};
function pushOrConcat(base, toPush) {
    if (toPush) {
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(toPush)) {
            Array.prototype.push.apply(base, toPush);
        } else {
            base.push(toPush);
        }
    }
    return base;
}
 function splitNewlines(str) {
    if ((typeof str === 'string' || str instanceof String) && str.indexOf('\n') > -1) {
        return str.split('\n');
    }
    return str;
}
 function createTooltipItem(chart, item) {
    const { element , datasetIndex , index  } = item;
    const controller = chart.getDatasetMeta(datasetIndex).controller;
    const { label , value  } = controller.getLabelAndValue(index);
    return {
        chart,
        label,
        parsed: controller.getParsed(index),
        raw: chart.data.datasets[datasetIndex].data[index],
        formattedValue: value,
        dataset: controller.getDataset(),
        dataIndex: index,
        datasetIndex,
        element
    };
}
 function getTooltipSize(tooltip, options) {
    const ctx = tooltip.chart.ctx;
    const { body , footer , title  } = tooltip;
    const { boxWidth , boxHeight  } = options;
    const bodyFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.bodyFont);
    const titleFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.titleFont);
    const footerFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.footerFont);
    const titleLineCount = title.length;
    const footerLineCount = footer.length;
    const bodyLineItemCount = body.length;
    const padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(options.padding);
    let height = padding.height;
    let width = 0;
    let combinedBodyLength = body.reduce((count, bodyItem)=>count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length, 0);
    combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length;
    if (titleLineCount) {
        height += titleLineCount * titleFont.lineHeight + (titleLineCount - 1) * options.titleSpacing + options.titleMarginBottom;
    }
    if (combinedBodyLength) {
        const bodyLineHeight = options.displayColors ? Math.max(boxHeight, bodyFont.lineHeight) : bodyFont.lineHeight;
        height += bodyLineItemCount * bodyLineHeight + (combinedBodyLength - bodyLineItemCount) * bodyFont.lineHeight + (combinedBodyLength - 1) * options.bodySpacing;
    }
    if (footerLineCount) {
        height += options.footerMarginTop + footerLineCount * footerFont.lineHeight + (footerLineCount - 1) * options.footerSpacing;
    }
    let widthPadding = 0;
    const maxLineWidth = function(line) {
        width = Math.max(width, ctx.measureText(line).width + widthPadding);
    };
    ctx.save();
    ctx.font = titleFont.string;
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(tooltip.title, maxLineWidth);
    ctx.font = bodyFont.string;
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth);
    widthPadding = options.displayColors ? boxWidth + 2 + options.boxPadding : 0;
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(body, (bodyItem)=>{
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(bodyItem.before, maxLineWidth);
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(bodyItem.lines, maxLineWidth);
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(bodyItem.after, maxLineWidth);
    });
    widthPadding = 0;
    ctx.font = footerFont.string;
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(tooltip.footer, maxLineWidth);
    ctx.restore();
    width += padding.width;
    return {
        width,
        height
    };
}
function determineYAlign(chart, size) {
    const { y , height  } = size;
    if (y < height / 2) {
        return 'top';
    } else if (y > chart.height - height / 2) {
        return 'bottom';
    }
    return 'center';
}
function doesNotFitWithAlign(xAlign, chart, options, size) {
    const { x , width  } = size;
    const caret = options.caretSize + options.caretPadding;
    if (xAlign === 'left' && x + width + caret > chart.width) {
        return true;
    }
    if (xAlign === 'right' && x - width - caret < 0) {
        return true;
    }
}
function determineXAlign(chart, options, size, yAlign) {
    const { x , width  } = size;
    const { width: chartWidth , chartArea: { left , right  }  } = chart;
    let xAlign = 'center';
    if (yAlign === 'center') {
        xAlign = x <= (left + right) / 2 ? 'left' : 'right';
    } else if (x <= width / 2) {
        xAlign = 'left';
    } else if (x >= chartWidth - width / 2) {
        xAlign = 'right';
    }
    if (doesNotFitWithAlign(xAlign, chart, options, size)) {
        xAlign = 'center';
    }
    return xAlign;
}
 function determineAlignment(chart, options, size) {
    const yAlign = size.yAlign || options.yAlign || determineYAlign(chart, size);
    return {
        xAlign: size.xAlign || options.xAlign || determineXAlign(chart, options, size, yAlign),
        yAlign
    };
}
function alignX(size, xAlign) {
    let { x , width  } = size;
    if (xAlign === 'right') {
        x -= width;
    } else if (xAlign === 'center') {
        x -= width / 2;
    }
    return x;
}
function alignY(size, yAlign, paddingAndSize) {
    let { y , height  } = size;
    if (yAlign === 'top') {
        y += paddingAndSize;
    } else if (yAlign === 'bottom') {
        y -= height + paddingAndSize;
    } else {
        y -= height / 2;
    }
    return y;
}
 function getBackgroundPoint(options, size, alignment, chart) {
    const { caretSize , caretPadding , cornerRadius  } = options;
    const { xAlign , yAlign  } = alignment;
    const paddingAndSize = caretSize + caretPadding;
    const { topLeft , topRight , bottomLeft , bottomRight  } = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(cornerRadius);
    let x = alignX(size, xAlign);
    const y = alignY(size, yAlign, paddingAndSize);
    if (yAlign === 'center') {
        if (xAlign === 'left') {
            x += paddingAndSize;
        } else if (xAlign === 'right') {
            x -= paddingAndSize;
        }
    } else if (xAlign === 'left') {
        x -= Math.max(topLeft, bottomLeft) + caretSize;
    } else if (xAlign === 'right') {
        x += Math.max(topRight, bottomRight) + caretSize;
    }
    return {
        x: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(x, 0, chart.width - size.width),
        y: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(y, 0, chart.height - size.height)
    };
}
function getAlignedX(tooltip, align, options) {
    const padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(options.padding);
    return align === 'center' ? tooltip.x + tooltip.width / 2 : align === 'right' ? tooltip.x + tooltip.width - padding.right : tooltip.x + padding.left;
}
 function getBeforeAfterBodyLines(callback) {
    return pushOrConcat([], splitNewlines(callback));
}
function createTooltipContext(parent, tooltip, tooltipItems) {
    return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(parent, {
        tooltip,
        tooltipItems,
        type: 'tooltip'
    });
}
function overrideCallbacks(callbacks, context) {
    const override = context && context.dataset && context.dataset.tooltip && context.dataset.tooltip.callbacks;
    return override ? callbacks.override(override) : callbacks;
}
const defaultCallbacks = {
    beforeTitle: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
    title (tooltipItems) {
        if (tooltipItems.length > 0) {
            const item = tooltipItems[0];
            const labels = item.chart.data.labels;
            const labelCount = labels ? labels.length : 0;
            if (this && this.options && this.options.mode === 'dataset') {
                return item.dataset.label || '';
            } else if (item.label) {
                return item.label;
            } else if (labelCount > 0 && item.dataIndex < labelCount) {
                return labels[item.dataIndex];
            }
        }
        return '';
    },
    afterTitle: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
    beforeBody: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
    beforeLabel: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
    label (tooltipItem) {
        if (this && this.options && this.options.mode === 'dataset') {
            return tooltipItem.label + ': ' + tooltipItem.formattedValue || tooltipItem.formattedValue;
        }
        let label = tooltipItem.dataset.label || '';
        if (label) {
            label += ': ';
        }
        const value = tooltipItem.formattedValue;
        if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(value)) {
            label += value;
        }
        return label;
    },
    labelColor (tooltipItem) {
        const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
        const options = meta.controller.getStyle(tooltipItem.dataIndex);
        return {
            borderColor: options.borderColor,
            backgroundColor: options.backgroundColor,
            borderWidth: options.borderWidth,
            borderDash: options.borderDash,
            borderDashOffset: options.borderDashOffset,
            borderRadius: 0
        };
    },
    labelTextColor () {
        return this.options.bodyColor;
    },
    labelPointStyle (tooltipItem) {
        const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
        const options = meta.controller.getStyle(tooltipItem.dataIndex);
        return {
            pointStyle: options.pointStyle,
            rotation: options.rotation
        };
    },
    afterLabel: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
    afterBody: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
    beforeFooter: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
    footer: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
    afterFooter: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF
};
 function invokeCallbackWithFallback(callbacks, name, ctx, arg) {
    const result = callbacks[name].call(ctx, arg);
    if (typeof result === 'undefined') {
        return defaultCallbacks[name].call(ctx, arg);
    }
    return result;
}
class Tooltip extends Element {
 static positioners = positioners;
    constructor(config){
        super();
        this.opacity = 0;
        this._active = [];
        this._eventPosition = undefined;
        this._size = undefined;
        this._cachedAnimations = undefined;
        this._tooltipItems = [];
        this.$animations = undefined;
        this.$context = undefined;
        this.chart = config.chart;
        this.options = config.options;
        this.dataPoints = undefined;
        this.title = undefined;
        this.beforeBody = undefined;
        this.body = undefined;
        this.afterBody = undefined;
        this.footer = undefined;
        this.xAlign = undefined;
        this.yAlign = undefined;
        this.x = undefined;
        this.y = undefined;
        this.height = undefined;
        this.width = undefined;
        this.caretX = undefined;
        this.caretY = undefined;
        this.labelColors = undefined;
        this.labelPointStyles = undefined;
        this.labelTextColors = undefined;
    }
    initialize(options) {
        this.options = options;
        this._cachedAnimations = undefined;
        this.$context = undefined;
    }
 _resolveAnimations() {
        const cached = this._cachedAnimations;
        if (cached) {
            return cached;
        }
        const chart = this.chart;
        const options = this.options.setContext(this.getContext());
        const opts = options.enabled && chart.options.animation && options.animations;
        const animations = new Animations(this.chart, opts);
        if (opts._cacheable) {
            this._cachedAnimations = Object.freeze(animations);
        }
        return animations;
    }
 getContext() {
        return this.$context || (this.$context = createTooltipContext(this.chart.getContext(), this, this._tooltipItems));
    }
    getTitle(context, options) {
        const { callbacks  } = options;
        const beforeTitle = invokeCallbackWithFallback(callbacks, 'beforeTitle', this, context);
        const title = invokeCallbackWithFallback(callbacks, 'title', this, context);
        const afterTitle = invokeCallbackWithFallback(callbacks, 'afterTitle', this, context);
        let lines = [];
        lines = pushOrConcat(lines, splitNewlines(beforeTitle));
        lines = pushOrConcat(lines, splitNewlines(title));
        lines = pushOrConcat(lines, splitNewlines(afterTitle));
        return lines;
    }
    getBeforeBody(tooltipItems, options) {
        return getBeforeAfterBodyLines(invokeCallbackWithFallback(options.callbacks, 'beforeBody', this, tooltipItems));
    }
    getBody(tooltipItems, options) {
        const { callbacks  } = options;
        const bodyItems = [];
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(tooltipItems, (context)=>{
            const bodyItem = {
                before: [],
                lines: [],
                after: []
            };
            const scoped = overrideCallbacks(callbacks, context);
            pushOrConcat(bodyItem.before, splitNewlines(invokeCallbackWithFallback(scoped, 'beforeLabel', this, context)));
            pushOrConcat(bodyItem.lines, invokeCallbackWithFallback(scoped, 'label', this, context));
            pushOrConcat(bodyItem.after, splitNewlines(invokeCallbackWithFallback(scoped, 'afterLabel', this, context)));
            bodyItems.push(bodyItem);
        });
        return bodyItems;
    }
    getAfterBody(tooltipItems, options) {
        return getBeforeAfterBodyLines(invokeCallbackWithFallback(options.callbacks, 'afterBody', this, tooltipItems));
    }
    getFooter(tooltipItems, options) {
        const { callbacks  } = options;
        const beforeFooter = invokeCallbackWithFallback(callbacks, 'beforeFooter', this, tooltipItems);
        const footer = invokeCallbackWithFallback(callbacks, 'footer', this, tooltipItems);
        const afterFooter = invokeCallbackWithFallback(callbacks, 'afterFooter', this, tooltipItems);
        let lines = [];
        lines = pushOrConcat(lines, splitNewlines(beforeFooter));
        lines = pushOrConcat(lines, splitNewlines(footer));
        lines = pushOrConcat(lines, splitNewlines(afterFooter));
        return lines;
    }
 _createItems(options) {
        const active = this._active;
        const data = this.chart.data;
        const labelColors = [];
        const labelPointStyles = [];
        const labelTextColors = [];
        let tooltipItems = [];
        let i, len;
        for(i = 0, len = active.length; i < len; ++i){
            tooltipItems.push(createTooltipItem(this.chart, active[i]));
        }
        if (options.filter) {
            tooltipItems = tooltipItems.filter((element, index, array)=>options.filter(element, index, array, data));
        }
        if (options.itemSort) {
            tooltipItems = tooltipItems.sort((a, b)=>options.itemSort(a, b, data));
        }
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(tooltipItems, (context)=>{
            const scoped = overrideCallbacks(options.callbacks, context);
            labelColors.push(invokeCallbackWithFallback(scoped, 'labelColor', this, context));
            labelPointStyles.push(invokeCallbackWithFallback(scoped, 'labelPointStyle', this, context));
            labelTextColors.push(invokeCallbackWithFallback(scoped, 'labelTextColor', this, context));
        });
        this.labelColors = labelColors;
        this.labelPointStyles = labelPointStyles;
        this.labelTextColors = labelTextColors;
        this.dataPoints = tooltipItems;
        return tooltipItems;
    }
    update(changed, replay) {
        const options = this.options.setContext(this.getContext());
        const active = this._active;
        let properties;
        let tooltipItems = [];
        if (!active.length) {
            if (this.opacity !== 0) {
                properties = {
                    opacity: 0
                };
            }
        } else {
            const position = positioners[options.position].call(this, active, this._eventPosition);
            tooltipItems = this._createItems(options);
            this.title = this.getTitle(tooltipItems, options);
            this.beforeBody = this.getBeforeBody(tooltipItems, options);
            this.body = this.getBody(tooltipItems, options);
            this.afterBody = this.getAfterBody(tooltipItems, options);
            this.footer = this.getFooter(tooltipItems, options);
            const size = this._size = getTooltipSize(this, options);
            const positionAndSize = Object.assign({}, position, size);
            const alignment = determineAlignment(this.chart, options, positionAndSize);
            const backgroundPoint = getBackgroundPoint(options, positionAndSize, alignment, this.chart);
            this.xAlign = alignment.xAlign;
            this.yAlign = alignment.yAlign;
            properties = {
                opacity: 1,
                x: backgroundPoint.x,
                y: backgroundPoint.y,
                width: size.width,
                height: size.height,
                caretX: position.x,
                caretY: position.y
            };
        }
        this._tooltipItems = tooltipItems;
        this.$context = undefined;
        if (properties) {
            this._resolveAnimations().update(this, properties);
        }
        if (changed && options.external) {
            options.external.call(this, {
                chart: this.chart,
                tooltip: this,
                replay
            });
        }
    }
    drawCaret(tooltipPoint, ctx, size, options) {
        const caretPosition = this.getCaretPosition(tooltipPoint, size, options);
        ctx.lineTo(caretPosition.x1, caretPosition.y1);
        ctx.lineTo(caretPosition.x2, caretPosition.y2);
        ctx.lineTo(caretPosition.x3, caretPosition.y3);
    }
    getCaretPosition(tooltipPoint, size, options) {
        const { xAlign , yAlign  } = this;
        const { caretSize , cornerRadius  } = options;
        const { topLeft , topRight , bottomLeft , bottomRight  } = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(cornerRadius);
        const { x: ptX , y: ptY  } = tooltipPoint;
        const { width , height  } = size;
        let x1, x2, x3, y1, y2, y3;
        if (yAlign === 'center') {
            y2 = ptY + height / 2;
            if (xAlign === 'left') {
                x1 = ptX;
                x2 = x1 - caretSize;
                y1 = y2 + caretSize;
                y3 = y2 - caretSize;
            } else {
                x1 = ptX + width;
                x2 = x1 + caretSize;
                y1 = y2 - caretSize;
                y3 = y2 + caretSize;
            }
            x3 = x1;
        } else {
            if (xAlign === 'left') {
                x2 = ptX + Math.max(topLeft, bottomLeft) + caretSize;
            } else if (xAlign === 'right') {
                x2 = ptX + width - Math.max(topRight, bottomRight) - caretSize;
            } else {
                x2 = this.caretX;
            }
            if (yAlign === 'top') {
                y1 = ptY;
                y2 = y1 - caretSize;
                x1 = x2 - caretSize;
                x3 = x2 + caretSize;
            } else {
                y1 = ptY + height;
                y2 = y1 + caretSize;
                x1 = x2 + caretSize;
                x3 = x2 - caretSize;
            }
            y3 = y1;
        }
        return {
            x1,
            x2,
            x3,
            y1,
            y2,
            y3
        };
    }
    drawTitle(pt, ctx, options) {
        const title = this.title;
        const length = title.length;
        let titleFont, titleSpacing, i;
        if (length) {
            const rtlHelper = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az)(options.rtl, this.x, this.width);
            pt.x = getAlignedX(this, options.titleAlign, options);
            ctx.textAlign = rtlHelper.textAlign(options.titleAlign);
            ctx.textBaseline = 'middle';
            titleFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.titleFont);
            titleSpacing = options.titleSpacing;
            ctx.fillStyle = options.titleColor;
            ctx.font = titleFont.string;
            for(i = 0; i < length; ++i){
                ctx.fillText(title[i], rtlHelper.x(pt.x), pt.y + titleFont.lineHeight / 2);
                pt.y += titleFont.lineHeight + titleSpacing;
                if (i + 1 === length) {
                    pt.y += options.titleMarginBottom - titleSpacing;
                }
            }
        }
    }
 _drawColorBox(ctx, pt, i, rtlHelper, options) {
        const labelColor = this.labelColors[i];
        const labelPointStyle = this.labelPointStyles[i];
        const { boxHeight , boxWidth  } = options;
        const bodyFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.bodyFont);
        const colorX = getAlignedX(this, 'left', options);
        const rtlColorX = rtlHelper.x(colorX);
        const yOffSet = boxHeight < bodyFont.lineHeight ? (bodyFont.lineHeight - boxHeight) / 2 : 0;
        const colorY = pt.y + yOffSet;
        if (options.usePointStyle) {
            const drawOptions = {
                radius: Math.min(boxWidth, boxHeight) / 2,
                pointStyle: labelPointStyle.pointStyle,
                rotation: labelPointStyle.rotation,
                borderWidth: 1
            };
            const centerX = rtlHelper.leftForLtr(rtlColorX, boxWidth) + boxWidth / 2;
            const centerY = colorY + boxHeight / 2;
            ctx.strokeStyle = options.multiKeyBackground;
            ctx.fillStyle = options.multiKeyBackground;
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.at)(ctx, drawOptions, centerX, centerY);
            ctx.strokeStyle = labelColor.borderColor;
            ctx.fillStyle = labelColor.backgroundColor;
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.at)(ctx, drawOptions, centerX, centerY);
        } else {
            ctx.lineWidth = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(labelColor.borderWidth) ? Math.max(...Object.values(labelColor.borderWidth)) : labelColor.borderWidth || 1;
            ctx.strokeStyle = labelColor.borderColor;
            ctx.setLineDash(labelColor.borderDash || []);
            ctx.lineDashOffset = labelColor.borderDashOffset || 0;
            const outerX = rtlHelper.leftForLtr(rtlColorX, boxWidth);
            const innerX = rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), boxWidth - 2);
            const borderRadius = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(labelColor.borderRadius);
            if (Object.values(borderRadius).some((v)=>v !== 0)) {
                ctx.beginPath();
                ctx.fillStyle = options.multiKeyBackground;
                (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.au)(ctx, {
                    x: outerX,
                    y: colorY,
                    w: boxWidth,
                    h: boxHeight,
                    radius: borderRadius
                });
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = labelColor.backgroundColor;
                ctx.beginPath();
                (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.au)(ctx, {
                    x: innerX,
                    y: colorY + 1,
                    w: boxWidth - 2,
                    h: boxHeight - 2,
                    radius: borderRadius
                });
                ctx.fill();
            } else {
                ctx.fillStyle = options.multiKeyBackground;
                ctx.fillRect(outerX, colorY, boxWidth, boxHeight);
                ctx.strokeRect(outerX, colorY, boxWidth, boxHeight);
                ctx.fillStyle = labelColor.backgroundColor;
                ctx.fillRect(innerX, colorY + 1, boxWidth - 2, boxHeight - 2);
            }
        }
        ctx.fillStyle = this.labelTextColors[i];
    }
    drawBody(pt, ctx, options) {
        const { body  } = this;
        const { bodySpacing , bodyAlign , displayColors , boxHeight , boxWidth , boxPadding  } = options;
        const bodyFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.bodyFont);
        let bodyLineHeight = bodyFont.lineHeight;
        let xLinePadding = 0;
        const rtlHelper = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az)(options.rtl, this.x, this.width);
        const fillLineOfText = function(line) {
            ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyLineHeight / 2);
            pt.y += bodyLineHeight + bodySpacing;
        };
        const bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign);
        let bodyItem, textColor, lines, i, j, ilen, jlen;
        ctx.textAlign = bodyAlign;
        ctx.textBaseline = 'middle';
        ctx.font = bodyFont.string;
        pt.x = getAlignedX(this, bodyAlignForCalculation, options);
        ctx.fillStyle = options.bodyColor;
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this.beforeBody, fillLineOfText);
        xLinePadding = displayColors && bodyAlignForCalculation !== 'right' ? bodyAlign === 'center' ? boxWidth / 2 + boxPadding : boxWidth + 2 + boxPadding : 0;
        for(i = 0, ilen = body.length; i < ilen; ++i){
            bodyItem = body[i];
            textColor = this.labelTextColors[i];
            ctx.fillStyle = textColor;
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(bodyItem.before, fillLineOfText);
            lines = bodyItem.lines;
            if (displayColors && lines.length) {
                this._drawColorBox(ctx, pt, i, rtlHelper, options);
                bodyLineHeight = Math.max(bodyFont.lineHeight, boxHeight);
            }
            for(j = 0, jlen = lines.length; j < jlen; ++j){
                fillLineOfText(lines[j]);
                bodyLineHeight = bodyFont.lineHeight;
            }
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(bodyItem.after, fillLineOfText);
        }
        xLinePadding = 0;
        bodyLineHeight = bodyFont.lineHeight;
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this.afterBody, fillLineOfText);
        pt.y -= bodySpacing;
    }
    drawFooter(pt, ctx, options) {
        const footer = this.footer;
        const length = footer.length;
        let footerFont, i;
        if (length) {
            const rtlHelper = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az)(options.rtl, this.x, this.width);
            pt.x = getAlignedX(this, options.footerAlign, options);
            pt.y += options.footerMarginTop;
            ctx.textAlign = rtlHelper.textAlign(options.footerAlign);
            ctx.textBaseline = 'middle';
            footerFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.footerFont);
            ctx.fillStyle = options.footerColor;
            ctx.font = footerFont.string;
            for(i = 0; i < length; ++i){
                ctx.fillText(footer[i], rtlHelper.x(pt.x), pt.y + footerFont.lineHeight / 2);
                pt.y += footerFont.lineHeight + options.footerSpacing;
            }
        }
    }
    drawBackground(pt, ctx, tooltipSize, options) {
        const { xAlign , yAlign  } = this;
        const { x , y  } = pt;
        const { width , height  } = tooltipSize;
        const { topLeft , topRight , bottomLeft , bottomRight  } = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(options.cornerRadius);
        ctx.fillStyle = options.backgroundColor;
        ctx.strokeStyle = options.borderColor;
        ctx.lineWidth = options.borderWidth;
        ctx.beginPath();
        ctx.moveTo(x + topLeft, y);
        if (yAlign === 'top') {
            this.drawCaret(pt, ctx, tooltipSize, options);
        }
        ctx.lineTo(x + width - topRight, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
        if (yAlign === 'center' && xAlign === 'right') {
            this.drawCaret(pt, ctx, tooltipSize, options);
        }
        ctx.lineTo(x + width, y + height - bottomRight);
        ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
        if (yAlign === 'bottom') {
            this.drawCaret(pt, ctx, tooltipSize, options);
        }
        ctx.lineTo(x + bottomLeft, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
        if (yAlign === 'center' && xAlign === 'left') {
            this.drawCaret(pt, ctx, tooltipSize, options);
        }
        ctx.lineTo(x, y + topLeft);
        ctx.quadraticCurveTo(x, y, x + topLeft, y);
        ctx.closePath();
        ctx.fill();
        if (options.borderWidth > 0) {
            ctx.stroke();
        }
    }
 _updateAnimationTarget(options) {
        const chart = this.chart;
        const anims = this.$animations;
        const animX = anims && anims.x;
        const animY = anims && anims.y;
        if (animX || animY) {
            const position = positioners[options.position].call(this, this._active, this._eventPosition);
            if (!position) {
                return;
            }
            const size = this._size = getTooltipSize(this, options);
            const positionAndSize = Object.assign({}, position, this._size);
            const alignment = determineAlignment(chart, options, positionAndSize);
            const point = getBackgroundPoint(options, positionAndSize, alignment, chart);
            if (animX._to !== point.x || animY._to !== point.y) {
                this.xAlign = alignment.xAlign;
                this.yAlign = alignment.yAlign;
                this.width = size.width;
                this.height = size.height;
                this.caretX = position.x;
                this.caretY = position.y;
                this._resolveAnimations().update(this, point);
            }
        }
    }
 _willRender() {
        return !!this.opacity;
    }
    draw(ctx) {
        const options = this.options.setContext(this.getContext());
        let opacity = this.opacity;
        if (!opacity) {
            return;
        }
        this._updateAnimationTarget(options);
        const tooltipSize = {
            width: this.width,
            height: this.height
        };
        const pt = {
            x: this.x,
            y: this.y
        };
        opacity = Math.abs(opacity) < 1e-3 ? 0 : opacity;
        const padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(options.padding);
        const hasTooltipContent = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
        if (options.enabled && hasTooltipContent) {
            ctx.save();
            ctx.globalAlpha = opacity;
            this.drawBackground(pt, ctx, tooltipSize, options);
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aA)(ctx, options.textDirection);
            pt.y += padding.top;
            this.drawTitle(pt, ctx, options);
            this.drawBody(pt, ctx, options);
            this.drawFooter(pt, ctx, options);
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aC)(ctx, options.textDirection);
            ctx.restore();
        }
    }
 getActiveElements() {
        return this._active || [];
    }
 setActiveElements(activeElements, eventPosition) {
        const lastActive = this._active;
        const active = activeElements.map(({ datasetIndex , index  })=>{
            const meta = this.chart.getDatasetMeta(datasetIndex);
            if (!meta) {
                throw new Error('Cannot find a dataset at index ' + datasetIndex);
            }
            return {
                datasetIndex,
                element: meta.data[index],
                index
            };
        });
        const changed = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ah)(lastActive, active);
        const positionChanged = this._positionChanged(active, eventPosition);
        if (changed || positionChanged) {
            this._active = active;
            this._eventPosition = eventPosition;
            this._ignoreReplayEvents = true;
            this.update(true);
        }
    }
 handleEvent(e, replay, inChartArea = true) {
        if (replay && this._ignoreReplayEvents) {
            return false;
        }
        this._ignoreReplayEvents = false;
        const options = this.options;
        const lastActive = this._active || [];
        const active = this._getActiveElements(e, lastActive, replay, inChartArea);
        const positionChanged = this._positionChanged(active, e);
        const changed = replay || !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ah)(active, lastActive) || positionChanged;
        if (changed) {
            this._active = active;
            if (options.enabled || options.external) {
                this._eventPosition = {
                    x: e.x,
                    y: e.y
                };
                this.update(true, replay);
            }
        }
        return changed;
    }
 _getActiveElements(e, lastActive, replay, inChartArea) {
        const options = this.options;
        if (e.type === 'mouseout') {
            return [];
        }
        if (!inChartArea) {
            return lastActive.filter((i)=>this.chart.data.datasets[i.datasetIndex] && this.chart.getDatasetMeta(i.datasetIndex).controller.getParsed(i.index) !== undefined);
        }
        const active = this.chart.getElementsAtEventForMode(e, options.mode, options, replay);
        if (options.reverse) {
            active.reverse();
        }
        return active;
    }
 _positionChanged(active, e) {
        const { caretX , caretY , options  } = this;
        const position = positioners[options.position].call(this, active, e);
        return position !== false && (caretX !== position.x || caretY !== position.y);
    }
}
var plugin_tooltip = {
    id: 'tooltip',
    _element: Tooltip,
    positioners,
    afterInit (chart, _args, options) {
        if (options) {
            chart.tooltip = new Tooltip({
                chart,
                options
            });
        }
    },
    beforeUpdate (chart, _args, options) {
        if (chart.tooltip) {
            chart.tooltip.initialize(options);
        }
    },
    reset (chart, _args, options) {
        if (chart.tooltip) {
            chart.tooltip.initialize(options);
        }
    },
    afterDraw (chart) {
        const tooltip = chart.tooltip;
        if (tooltip && tooltip._willRender()) {
            const args = {
                tooltip
            };
            if (chart.notifyPlugins('beforeTooltipDraw', {
                ...args,
                cancelable: true
            }) === false) {
                return;
            }
            tooltip.draw(chart.ctx);
            chart.notifyPlugins('afterTooltipDraw', args);
        }
    },
    afterEvent (chart, args) {
        if (chart.tooltip) {
            const useFinalPosition = args.replay;
            if (chart.tooltip.handleEvent(args.event, useFinalPosition, args.inChartArea)) {
                args.changed = true;
            }
        }
    },
    defaults: {
        enabled: true,
        external: null,
        position: 'average',
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        titleFont: {
            weight: 'bold'
        },
        titleSpacing: 2,
        titleMarginBottom: 6,
        titleAlign: 'left',
        bodyColor: '#fff',
        bodySpacing: 2,
        bodyFont: {},
        bodyAlign: 'left',
        footerColor: '#fff',
        footerSpacing: 2,
        footerMarginTop: 6,
        footerFont: {
            weight: 'bold'
        },
        footerAlign: 'left',
        padding: 6,
        caretPadding: 2,
        caretSize: 5,
        cornerRadius: 6,
        boxHeight: (ctx, opts)=>opts.bodyFont.size,
        boxWidth: (ctx, opts)=>opts.bodyFont.size,
        multiKeyBackground: '#fff',
        displayColors: true,
        boxPadding: 0,
        borderColor: 'rgba(0,0,0,0)',
        borderWidth: 0,
        animation: {
            duration: 400,
            easing: 'easeOutQuart'
        },
        animations: {
            numbers: {
                type: 'number',
                properties: [
                    'x',
                    'y',
                    'width',
                    'height',
                    'caretX',
                    'caretY'
                ]
            },
            opacity: {
                easing: 'linear',
                duration: 200
            }
        },
        callbacks: defaultCallbacks
    },
    defaultRoutes: {
        bodyFont: 'font',
        footerFont: 'font',
        titleFont: 'font'
    },
    descriptors: {
        _scriptable: (name)=>name !== 'filter' && name !== 'itemSort' && name !== 'external',
        _indexable: false,
        callbacks: {
            _scriptable: false,
            _indexable: false
        },
        animation: {
            _fallback: false
        },
        animations: {
            _fallback: 'animation'
        }
    },
    additionalOptionScopes: [
        'interaction'
    ]
};

var plugins = /*#__PURE__*/Object.freeze({
__proto__: null,
Colors: plugin_colors,
Decimation: plugin_decimation,
Filler: index,
Legend: plugin_legend,
SubTitle: plugin_subtitle,
Title: plugin_title,
Tooltip: plugin_tooltip
});

const addIfString = (labels, raw, index, addedLabels)=>{
    if (typeof raw === 'string') {
        index = labels.push(raw) - 1;
        addedLabels.unshift({
            index,
            label: raw
        });
    } else if (isNaN(raw)) {
        index = null;
    }
    return index;
};
function findOrAddLabel(labels, raw, index, addedLabels) {
    const first = labels.indexOf(raw);
    if (first === -1) {
        return addIfString(labels, raw, index, addedLabels);
    }
    const last = labels.lastIndexOf(raw);
    return first !== last ? index : first;
}
const validIndex = (index, max)=>index === null ? null : (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(Math.round(index), 0, max);
function _getLabelForValue(value) {
    const labels = this.getLabels();
    if (value >= 0 && value < labels.length) {
        return labels[value];
    }
    return value;
}
class CategoryScale extends Scale {
    static id = 'category';
 static defaults = {
        ticks: {
            callback: _getLabelForValue
        }
    };
    constructor(cfg){
        super(cfg);
         this._startValue = undefined;
        this._valueRange = 0;
        this._addedLabels = [];
    }
    init(scaleOptions) {
        const added = this._addedLabels;
        if (added.length) {
            const labels = this.getLabels();
            for (const { index , label  } of added){
                if (labels[index] === label) {
                    labels.splice(index, 1);
                }
            }
            this._addedLabels = [];
        }
        super.init(scaleOptions);
    }
    parse(raw, index) {
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(raw)) {
            return null;
        }
        const labels = this.getLabels();
        index = isFinite(index) && labels[index] === raw ? index : findOrAddLabel(labels, raw, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(index, raw), this._addedLabels);
        return validIndex(index, labels.length - 1);
    }
    determineDataLimits() {
        const { minDefined , maxDefined  } = this.getUserBounds();
        let { min , max  } = this.getMinMax(true);
        if (this.options.bounds === 'ticks') {
            if (!minDefined) {
                min = 0;
            }
            if (!maxDefined) {
                max = this.getLabels().length - 1;
            }
        }
        this.min = min;
        this.max = max;
    }
    buildTicks() {
        const min = this.min;
        const max = this.max;
        const offset = this.options.offset;
        const ticks = [];
        let labels = this.getLabels();
        labels = min === 0 && max === labels.length - 1 ? labels : labels.slice(min, max + 1);
        this._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
        this._startValue = this.min - (offset ? 0.5 : 0);
        for(let value = min; value <= max; value++){
            ticks.push({
                value
            });
        }
        return ticks;
    }
    getLabelForValue(value) {
        return _getLabelForValue.call(this, value);
    }
 configure() {
        super.configure();
        if (!this.isHorizontal()) {
            this._reversePixels = !this._reversePixels;
        }
    }
    getPixelForValue(value) {
        if (typeof value !== 'number') {
            value = this.parse(value);
        }
        return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
    }
    getPixelForTick(index) {
        const ticks = this.ticks;
        if (index < 0 || index > ticks.length - 1) {
            return null;
        }
        return this.getPixelForValue(ticks[index].value);
    }
    getValueForPixel(pixel) {
        return Math.round(this._startValue + this.getDecimalForPixel(pixel) * this._valueRange);
    }
    getBasePixel() {
        return this.bottom;
    }
}

function generateTicks$1(generationOptions, dataRange) {
    const ticks = [];
    const MIN_SPACING = 1e-14;
    const { bounds , step , min , max , precision , count , maxTicks , maxDigits , includeBounds  } = generationOptions;
    const unit = step || 1;
    const maxSpaces = maxTicks - 1;
    const { min: rmin , max: rmax  } = dataRange;
    const minDefined = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(min);
    const maxDefined = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(max);
    const countDefined = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(count);
    const minSpacing = (rmax - rmin) / (maxDigits + 1);
    let spacing = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aH)((rmax - rmin) / maxSpaces / unit) * unit;
    let factor, niceMin, niceMax, numSpaces;
    if (spacing < MIN_SPACING && !minDefined && !maxDefined) {
        return [
            {
                value: rmin
            },
            {
                value: rmax
            }
        ];
    }
    numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
    if (numSpaces > maxSpaces) {
        spacing = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aH)(numSpaces * spacing / maxSpaces / unit) * unit;
    }
    if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(precision)) {
        factor = Math.pow(10, precision);
        spacing = Math.ceil(spacing * factor) / factor;
    }
    if (bounds === 'ticks') {
        niceMin = Math.floor(rmin / spacing) * spacing;
        niceMax = Math.ceil(rmax / spacing) * spacing;
    } else {
        niceMin = rmin;
        niceMax = rmax;
    }
    if (minDefined && maxDefined && step && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aI)((max - min) / step, spacing / 1000)) {
        numSpaces = Math.round(Math.min((max - min) / spacing, maxTicks));
        spacing = (max - min) / numSpaces;
        niceMin = min;
        niceMax = max;
    } else if (countDefined) {
        niceMin = minDefined ? min : niceMin;
        niceMax = maxDefined ? max : niceMax;
        numSpaces = count - 1;
        spacing = (niceMax - niceMin) / numSpaces;
    } else {
        numSpaces = (niceMax - niceMin) / spacing;
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aJ)(numSpaces, Math.round(numSpaces), spacing / 1000)) {
            numSpaces = Math.round(numSpaces);
        } else {
            numSpaces = Math.ceil(numSpaces);
        }
    }
    const decimalPlaces = Math.max((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aK)(spacing), (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aK)(niceMin));
    factor = Math.pow(10, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(precision) ? decimalPlaces : precision);
    niceMin = Math.round(niceMin * factor) / factor;
    niceMax = Math.round(niceMax * factor) / factor;
    let j = 0;
    if (minDefined) {
        if (includeBounds && niceMin !== min) {
            ticks.push({
                value: min
            });
            if (niceMin < min) {
                j++;
            }
            if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aJ)(Math.round((niceMin + j * spacing) * factor) / factor, min, relativeLabelSize(min, minSpacing, generationOptions))) {
                j++;
            }
        } else if (niceMin < min) {
            j++;
        }
    }
    for(; j < numSpaces; ++j){
        const tickValue = Math.round((niceMin + j * spacing) * factor) / factor;
        if (maxDefined && tickValue > max) {
            break;
        }
        ticks.push({
            value: tickValue
        });
    }
    if (maxDefined && includeBounds && niceMax !== max) {
        if (ticks.length && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aJ)(ticks[ticks.length - 1].value, max, relativeLabelSize(max, minSpacing, generationOptions))) {
            ticks[ticks.length - 1].value = max;
        } else {
            ticks.push({
                value: max
            });
        }
    } else if (!maxDefined || niceMax === max) {
        ticks.push({
            value: niceMax
        });
    }
    return ticks;
}
function relativeLabelSize(value, minSpacing, { horizontal , minRotation  }) {
    const rad = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(minRotation);
    const ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 0.001;
    const length = 0.75 * minSpacing * ('' + value).length;
    return Math.min(minSpacing / ratio, length);
}
class LinearScaleBase extends Scale {
    constructor(cfg){
        super(cfg);
         this.start = undefined;
         this.end = undefined;
         this._startValue = undefined;
         this._endValue = undefined;
        this._valueRange = 0;
    }
    parse(raw, index) {
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(raw)) {
            return null;
        }
        if ((typeof raw === 'number' || raw instanceof Number) && !isFinite(+raw)) {
            return null;
        }
        return +raw;
    }
    handleTickRangeOptions() {
        const { beginAtZero  } = this.options;
        const { minDefined , maxDefined  } = this.getUserBounds();
        let { min , max  } = this;
        const setMin = (v)=>min = minDefined ? min : v;
        const setMax = (v)=>max = maxDefined ? max : v;
        if (beginAtZero) {
            const minSign = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(min);
            const maxSign = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(max);
            if (minSign < 0 && maxSign < 0) {
                setMax(0);
            } else if (minSign > 0 && maxSign > 0) {
                setMin(0);
            }
        }
        if (min === max) {
            let offset = max === 0 ? 1 : Math.abs(max * 0.05);
            setMax(max + offset);
            if (!beginAtZero) {
                setMin(min - offset);
            }
        }
        this.min = min;
        this.max = max;
    }
    getTickLimit() {
        const tickOpts = this.options.ticks;
        let { maxTicksLimit , stepSize  } = tickOpts;
        let maxTicks;
        if (stepSize) {
            maxTicks = Math.ceil(this.max / stepSize) - Math.floor(this.min / stepSize) + 1;
            if (maxTicks > 1000) {
                console.warn(`scales.${this.id}.ticks.stepSize: ${stepSize} would result generating up to ${maxTicks} ticks. Limiting to 1000.`);
                maxTicks = 1000;
            }
        } else {
            maxTicks = this.computeTickLimit();
            maxTicksLimit = maxTicksLimit || 11;
        }
        if (maxTicksLimit) {
            maxTicks = Math.min(maxTicksLimit, maxTicks);
        }
        return maxTicks;
    }
 computeTickLimit() {
        return Number.POSITIVE_INFINITY;
    }
    buildTicks() {
        const opts = this.options;
        const tickOpts = opts.ticks;
        let maxTicks = this.getTickLimit();
        maxTicks = Math.max(2, maxTicks);
        const numericGeneratorOptions = {
            maxTicks,
            bounds: opts.bounds,
            min: opts.min,
            max: opts.max,
            precision: tickOpts.precision,
            step: tickOpts.stepSize,
            count: tickOpts.count,
            maxDigits: this._maxDigits(),
            horizontal: this.isHorizontal(),
            minRotation: tickOpts.minRotation || 0,
            includeBounds: tickOpts.includeBounds !== false
        };
        const dataRange = this._range || this;
        const ticks = generateTicks$1(numericGeneratorOptions, dataRange);
        if (opts.bounds === 'ticks') {
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aG)(ticks, this, 'value');
        }
        if (opts.reverse) {
            ticks.reverse();
            this.start = this.max;
            this.end = this.min;
        } else {
            this.start = this.min;
            this.end = this.max;
        }
        return ticks;
    }
 configure() {
        const ticks = this.ticks;
        let start = this.min;
        let end = this.max;
        super.configure();
        if (this.options.offset && ticks.length) {
            const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
            start -= offset;
            end += offset;
        }
        this._startValue = start;
        this._endValue = end;
        this._valueRange = end - start;
    }
    getLabelForValue(value) {
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.o)(value, this.chart.options.locale, this.options.ticks.format);
    }
}

class LinearScale extends LinearScaleBase {
    static id = 'linear';
 static defaults = {
        ticks: {
            callback: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aL.formatters.numeric
        }
    };
    determineDataLimits() {
        const { min , max  } = this.getMinMax(true);
        this.min = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(min) ? min : 0;
        this.max = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(max) ? max : 1;
        this.handleTickRangeOptions();
    }
 computeTickLimit() {
        const horizontal = this.isHorizontal();
        const length = horizontal ? this.width : this.height;
        const minRotation = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.options.ticks.minRotation);
        const ratio = (horizontal ? Math.sin(minRotation) : Math.cos(minRotation)) || 0.001;
        const tickFont = this._resolveTickFontOptions(0);
        return Math.ceil(length / Math.min(40, tickFont.lineHeight / ratio));
    }
    getPixelForValue(value) {
        return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
    }
    getValueForPixel(pixel) {
        return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
    }
}

const log10Floor = (v)=>Math.floor((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aM)(v));
const changeExponent = (v, m)=>Math.pow(10, log10Floor(v) + m);
function isMajor(tickVal) {
    const remain = tickVal / Math.pow(10, log10Floor(tickVal));
    return remain === 1;
}
function steps(min, max, rangeExp) {
    const rangeStep = Math.pow(10, rangeExp);
    const start = Math.floor(min / rangeStep);
    const end = Math.ceil(max / rangeStep);
    return end - start;
}
function startExp(min, max) {
    const range = max - min;
    let rangeExp = log10Floor(range);
    while(steps(min, max, rangeExp) > 10){
        rangeExp++;
    }
    while(steps(min, max, rangeExp) < 10){
        rangeExp--;
    }
    return Math.min(rangeExp, log10Floor(min));
}
 function generateTicks(generationOptions, { min , max  }) {
    min = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(generationOptions.min, min);
    const ticks = [];
    const minExp = log10Floor(min);
    let exp = startExp(min, max);
    let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;
    const stepSize = Math.pow(10, exp);
    const base = minExp > exp ? Math.pow(10, minExp) : 0;
    const start = Math.round((min - base) * precision) / precision;
    const offset = Math.floor((min - base) / stepSize / 10) * stepSize * 10;
    let significand = Math.floor((start - offset) / Math.pow(10, exp));
    let value = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(generationOptions.min, Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision);
    while(value < max){
        ticks.push({
            value,
            major: isMajor(value),
            significand
        });
        if (significand >= 10) {
            significand = significand < 15 ? 15 : 20;
        } else {
            significand++;
        }
        if (significand >= 20) {
            exp++;
            significand = 2;
            precision = exp >= 0 ? 1 : precision;
        }
        value = Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision;
    }
    const lastTick = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(generationOptions.max, value);
    ticks.push({
        value: lastTick,
        major: isMajor(lastTick),
        significand
    });
    return ticks;
}
class LogarithmicScale extends Scale {
    static id = 'logarithmic';
 static defaults = {
        ticks: {
            callback: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aL.formatters.logarithmic,
            major: {
                enabled: true
            }
        }
    };
    constructor(cfg){
        super(cfg);
         this.start = undefined;
         this.end = undefined;
         this._startValue = undefined;
        this._valueRange = 0;
    }
    parse(raw, index) {
        const value = LinearScaleBase.prototype.parse.apply(this, [
            raw,
            index
        ]);
        if (value === 0) {
            this._zero = true;
            return undefined;
        }
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(value) && value > 0 ? value : null;
    }
    determineDataLimits() {
        const { min , max  } = this.getMinMax(true);
        this.min = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(min) ? Math.max(0, min) : null;
        this.max = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(max) ? Math.max(0, max) : null;
        if (this.options.beginAtZero) {
            this._zero = true;
        }
        if (this._zero && this.min !== this._suggestedMin && !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(this._userMin)) {
            this.min = min === changeExponent(this.min, 0) ? changeExponent(this.min, -1) : changeExponent(this.min, 0);
        }
        this.handleTickRangeOptions();
    }
    handleTickRangeOptions() {
        const { minDefined , maxDefined  } = this.getUserBounds();
        let min = this.min;
        let max = this.max;
        const setMin = (v)=>min = minDefined ? min : v;
        const setMax = (v)=>max = maxDefined ? max : v;
        if (min === max) {
            if (min <= 0) {
                setMin(1);
                setMax(10);
            } else {
                setMin(changeExponent(min, -1));
                setMax(changeExponent(max, +1));
            }
        }
        if (min <= 0) {
            setMin(changeExponent(max, -1));
        }
        if (max <= 0) {
            setMax(changeExponent(min, +1));
        }
        this.min = min;
        this.max = max;
    }
    buildTicks() {
        const opts = this.options;
        const generationOptions = {
            min: this._userMin,
            max: this._userMax
        };
        const ticks = generateTicks(generationOptions, this);
        if (opts.bounds === 'ticks') {
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aG)(ticks, this, 'value');
        }
        if (opts.reverse) {
            ticks.reverse();
            this.start = this.max;
            this.end = this.min;
        } else {
            this.start = this.min;
            this.end = this.max;
        }
        return ticks;
    }
 getLabelForValue(value) {
        return value === undefined ? '0' : (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.o)(value, this.chart.options.locale, this.options.ticks.format);
    }
 configure() {
        const start = this.min;
        super.configure();
        this._startValue = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aM)(start);
        this._valueRange = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aM)(this.max) - (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aM)(start);
    }
    getPixelForValue(value) {
        if (value === undefined || value === 0) {
            value = this.min;
        }
        if (value === null || isNaN(value)) {
            return NaN;
        }
        return this.getPixelForDecimal(value === this.min ? 0 : ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aM)(value) - this._startValue) / this._valueRange);
    }
    getValueForPixel(pixel) {
        const decimal = this.getDecimalForPixel(pixel);
        return Math.pow(10, this._startValue + decimal * this._valueRange);
    }
}

function getTickBackdropHeight(opts) {
    const tickOpts = opts.ticks;
    if (tickOpts.display && opts.display) {
        const padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(tickOpts.backdropPadding);
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(tickOpts.font && tickOpts.font.size, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.font.size) + padding.height;
    }
    return 0;
}
function measureLabelSize(ctx, font, label) {
    label = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(label) ? label : [
        label
    ];
    return {
        w: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aN)(ctx, font.string, label),
        h: label.length * font.lineHeight
    };
}
function determineLimits(angle, pos, size, min, max) {
    if (angle === min || angle === max) {
        return {
            start: pos - size / 2,
            end: pos + size / 2
        };
    } else if (angle < min || angle > max) {
        return {
            start: pos - size,
            end: pos
        };
    }
    return {
        start: pos,
        end: pos + size
    };
}
 function fitWithPointLabels(scale) {
    const orig = {
        l: scale.left + scale._padding.left,
        r: scale.right - scale._padding.right,
        t: scale.top + scale._padding.top,
        b: scale.bottom - scale._padding.bottom
    };
    const limits = Object.assign({}, orig);
    const labelSizes = [];
    const padding = [];
    const valueCount = scale._pointLabels.length;
    const pointLabelOpts = scale.options.pointLabels;
    const additionalAngle = pointLabelOpts.centerPointLabels ? _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P / valueCount : 0;
    for(let i = 0; i < valueCount; i++){
        const opts = pointLabelOpts.setContext(scale.getPointLabelContext(i));
        padding[i] = opts.padding;
        const pointPosition = scale.getPointPosition(i, scale.drawingArea + padding[i], additionalAngle);
        const plFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(opts.font);
        const textSize = measureLabelSize(scale.ctx, plFont, scale._pointLabels[i]);
        labelSizes[i] = textSize;
        const angleRadians = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ay)(scale.getIndexAngle(i) + additionalAngle);
        const angle = Math.round((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.U)(angleRadians));
        const hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
        const vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);
        updateLimits(limits, orig, angleRadians, hLimits, vLimits);
    }
    scale.setCenterPoint(orig.l - limits.l, limits.r - orig.r, orig.t - limits.t, limits.b - orig.b);
    scale._pointLabelItems = buildPointLabelItems(scale, labelSizes, padding);
}
function updateLimits(limits, orig, angle, hLimits, vLimits) {
    const sin = Math.abs(Math.sin(angle));
    const cos = Math.abs(Math.cos(angle));
    let x = 0;
    let y = 0;
    if (hLimits.start < orig.l) {
        x = (orig.l - hLimits.start) / sin;
        limits.l = Math.min(limits.l, orig.l - x);
    } else if (hLimits.end > orig.r) {
        x = (hLimits.end - orig.r) / sin;
        limits.r = Math.max(limits.r, orig.r + x);
    }
    if (vLimits.start < orig.t) {
        y = (orig.t - vLimits.start) / cos;
        limits.t = Math.min(limits.t, orig.t - y);
    } else if (vLimits.end > orig.b) {
        y = (vLimits.end - orig.b) / cos;
        limits.b = Math.max(limits.b, orig.b + y);
    }
}
function createPointLabelItem(scale, index, itemOpts) {
    const outerDistance = scale.drawingArea;
    const { extra , additionalAngle , padding , size  } = itemOpts;
    const pointLabelPosition = scale.getPointPosition(index, outerDistance + extra + padding, additionalAngle);
    const angle = Math.round((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.U)((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ay)(pointLabelPosition.angle + _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H)));
    const y = yForAngle(pointLabelPosition.y, size.h, angle);
    const textAlign = getTextAlignForAngle(angle);
    const left = leftForTextAlign(pointLabelPosition.x, size.w, textAlign);
    return {
        visible: true,
        x: pointLabelPosition.x,
        y,
        textAlign,
        left,
        top: y,
        right: left + size.w,
        bottom: y + size.h
    };
}
function isNotOverlapped(item, area) {
    if (!area) {
        return true;
    }
    const { left , top , right , bottom  } = item;
    const apexesInArea = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)({
        x: left,
        y: top
    }, area) || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)({
        x: left,
        y: bottom
    }, area) || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)({
        x: right,
        y: top
    }, area) || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)({
        x: right,
        y: bottom
    }, area);
    return !apexesInArea;
}
function buildPointLabelItems(scale, labelSizes, padding) {
    const items = [];
    const valueCount = scale._pointLabels.length;
    const opts = scale.options;
    const { centerPointLabels , display  } = opts.pointLabels;
    const itemOpts = {
        extra: getTickBackdropHeight(opts) / 2,
        additionalAngle: centerPointLabels ? _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P / valueCount : 0
    };
    let area;
    for(let i = 0; i < valueCount; i++){
        itemOpts.padding = padding[i];
        itemOpts.size = labelSizes[i];
        const item = createPointLabelItem(scale, i, itemOpts);
        items.push(item);
        if (display === 'auto') {
            item.visible = isNotOverlapped(item, area);
            if (item.visible) {
                area = item;
            }
        }
    }
    return items;
}
function getTextAlignForAngle(angle) {
    if (angle === 0 || angle === 180) {
        return 'center';
    } else if (angle < 180) {
        return 'left';
    }
    return 'right';
}
function leftForTextAlign(x, w, align) {
    if (align === 'right') {
        x -= w;
    } else if (align === 'center') {
        x -= w / 2;
    }
    return x;
}
function yForAngle(y, h, angle) {
    if (angle === 90 || angle === 270) {
        y -= h / 2;
    } else if (angle > 270 || angle < 90) {
        y -= h;
    }
    return y;
}
function drawPointLabelBox(ctx, opts, item) {
    const { left , top , right , bottom  } = item;
    const { backdropColor  } = opts;
    if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(backdropColor)) {
        const borderRadius = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(opts.borderRadius);
        const padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(opts.backdropPadding);
        ctx.fillStyle = backdropColor;
        const backdropLeft = left - padding.left;
        const backdropTop = top - padding.top;
        const backdropWidth = right - left + padding.width;
        const backdropHeight = bottom - top + padding.height;
        if (Object.values(borderRadius).some((v)=>v !== 0)) {
            ctx.beginPath();
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.au)(ctx, {
                x: backdropLeft,
                y: backdropTop,
                w: backdropWidth,
                h: backdropHeight,
                radius: borderRadius
            });
            ctx.fill();
        } else {
            ctx.fillRect(backdropLeft, backdropTop, backdropWidth, backdropHeight);
        }
    }
}
function drawPointLabels(scale, labelCount) {
    const { ctx , options: { pointLabels  }  } = scale;
    for(let i = labelCount - 1; i >= 0; i--){
        const item = scale._pointLabelItems[i];
        if (!item.visible) {
            continue;
        }
        const optsAtIndex = pointLabels.setContext(scale.getPointLabelContext(i));
        drawPointLabelBox(ctx, optsAtIndex, item);
        const plFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(optsAtIndex.font);
        const { x , y , textAlign  } = item;
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, scale._pointLabels[i], x, y + plFont.lineHeight / 2, plFont, {
            color: optsAtIndex.color,
            textAlign: textAlign,
            textBaseline: 'middle'
        });
    }
}
function pathRadiusLine(scale, radius, circular, labelCount) {
    const { ctx  } = scale;
    if (circular) {
        ctx.arc(scale.xCenter, scale.yCenter, radius, 0, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T);
    } else {
        let pointPosition = scale.getPointPosition(0, radius);
        ctx.moveTo(pointPosition.x, pointPosition.y);
        for(let i = 1; i < labelCount; i++){
            pointPosition = scale.getPointPosition(i, radius);
            ctx.lineTo(pointPosition.x, pointPosition.y);
        }
    }
}
function drawRadiusLine(scale, gridLineOpts, radius, labelCount, borderOpts) {
    const ctx = scale.ctx;
    const circular = gridLineOpts.circular;
    const { color , lineWidth  } = gridLineOpts;
    if (!circular && !labelCount || !color || !lineWidth || radius < 0) {
        return;
    }
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(borderOpts.dash);
    ctx.lineDashOffset = borderOpts.dashOffset;
    ctx.beginPath();
    pathRadiusLine(scale, radius, circular, labelCount);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}
function createPointLabelContext(parent, index, label) {
    return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(parent, {
        label,
        index,
        type: 'pointLabel'
    });
}
class RadialLinearScale extends LinearScaleBase {
    static id = 'radialLinear';
 static defaults = {
        display: true,
        animate: true,
        position: 'chartArea',
        angleLines: {
            display: true,
            lineWidth: 1,
            borderDash: [],
            borderDashOffset: 0.0
        },
        grid: {
            circular: false
        },
        startAngle: 0,
        ticks: {
            showLabelBackdrop: true,
            callback: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aL.formatters.numeric
        },
        pointLabels: {
            backdropColor: undefined,
            backdropPadding: 2,
            display: true,
            font: {
                size: 10
            },
            callback (label) {
                return label;
            },
            padding: 5,
            centerPointLabels: false
        }
    };
    static defaultRoutes = {
        'angleLines.color': 'borderColor',
        'pointLabels.color': 'color',
        'ticks.color': 'color'
    };
    static descriptors = {
        angleLines: {
            _fallback: 'grid'
        }
    };
    constructor(cfg){
        super(cfg);
         this.xCenter = undefined;
         this.yCenter = undefined;
         this.drawingArea = undefined;
         this._pointLabels = [];
        this._pointLabelItems = [];
    }
    setDimensions() {
        const padding = this._padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(getTickBackdropHeight(this.options) / 2);
        const w = this.width = this.maxWidth - padding.width;
        const h = this.height = this.maxHeight - padding.height;
        this.xCenter = Math.floor(this.left + w / 2 + padding.left);
        this.yCenter = Math.floor(this.top + h / 2 + padding.top);
        this.drawingArea = Math.floor(Math.min(w, h) / 2);
    }
    determineDataLimits() {
        const { min , max  } = this.getMinMax(false);
        this.min = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(min) && !isNaN(min) ? min : 0;
        this.max = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(max) && !isNaN(max) ? max : 0;
        this.handleTickRangeOptions();
    }
 computeTickLimit() {
        return Math.ceil(this.drawingArea / getTickBackdropHeight(this.options));
    }
    generateTickLabels(ticks) {
        LinearScaleBase.prototype.generateTickLabels.call(this, ticks);
        this._pointLabels = this.getLabels().map((value, index)=>{
            const label = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.pointLabels.callback, [
                value,
                index
            ], this);
            return label || label === 0 ? label : '';
        }).filter((v, i)=>this.chart.getDataVisibility(i));
    }
    fit() {
        const opts = this.options;
        if (opts.display && opts.pointLabels.display) {
            fitWithPointLabels(this);
        } else {
            this.setCenterPoint(0, 0, 0, 0);
        }
    }
    setCenterPoint(leftMovement, rightMovement, topMovement, bottomMovement) {
        this.xCenter += Math.floor((leftMovement - rightMovement) / 2);
        this.yCenter += Math.floor((topMovement - bottomMovement) / 2);
        this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(leftMovement, rightMovement, topMovement, bottomMovement));
    }
    getIndexAngle(index) {
        const angleMultiplier = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T / (this._pointLabels.length || 1);
        const startAngle = this.options.startAngle || 0;
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ay)(index * angleMultiplier + (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(startAngle));
    }
    getDistanceFromCenterForValue(value) {
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(value)) {
            return NaN;
        }
        const scalingFactor = this.drawingArea / (this.max - this.min);
        if (this.options.reverse) {
            return (this.max - value) * scalingFactor;
        }
        return (value - this.min) * scalingFactor;
    }
    getValueForDistanceFromCenter(distance) {
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(distance)) {
            return NaN;
        }
        const scaledDistance = distance / (this.drawingArea / (this.max - this.min));
        return this.options.reverse ? this.max - scaledDistance : this.min + scaledDistance;
    }
    getPointLabelContext(index) {
        const pointLabels = this._pointLabels || [];
        if (index >= 0 && index < pointLabels.length) {
            const pointLabel = pointLabels[index];
            return createPointLabelContext(this.getContext(), index, pointLabel);
        }
    }
    getPointPosition(index, distanceFromCenter, additionalAngle = 0) {
        const angle = this.getIndexAngle(index) - _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H + additionalAngle;
        return {
            x: Math.cos(angle) * distanceFromCenter + this.xCenter,
            y: Math.sin(angle) * distanceFromCenter + this.yCenter,
            angle
        };
    }
    getPointPositionForValue(index, value) {
        return this.getPointPosition(index, this.getDistanceFromCenterForValue(value));
    }
    getBasePosition(index) {
        return this.getPointPositionForValue(index || 0, this.getBaseValue());
    }
    getPointLabelPosition(index) {
        const { left , top , right , bottom  } = this._pointLabelItems[index];
        return {
            left,
            top,
            right,
            bottom
        };
    }
 drawBackground() {
        const { backgroundColor , grid: { circular  }  } = this.options;
        if (backgroundColor) {
            const ctx = this.ctx;
            ctx.save();
            ctx.beginPath();
            pathRadiusLine(this, this.getDistanceFromCenterForValue(this._endValue), circular, this._pointLabels.length);
            ctx.closePath();
            ctx.fillStyle = backgroundColor;
            ctx.fill();
            ctx.restore();
        }
    }
 drawGrid() {
        const ctx = this.ctx;
        const opts = this.options;
        const { angleLines , grid , border  } = opts;
        const labelCount = this._pointLabels.length;
        let i, offset, position;
        if (opts.pointLabels.display) {
            drawPointLabels(this, labelCount);
        }
        if (grid.display) {
            this.ticks.forEach((tick, index)=>{
                if (index !== 0) {
                    offset = this.getDistanceFromCenterForValue(tick.value);
                    const context = this.getContext(index);
                    const optsAtIndex = grid.setContext(context);
                    const optsAtIndexBorder = border.setContext(context);
                    drawRadiusLine(this, optsAtIndex, offset, labelCount, optsAtIndexBorder);
                }
            });
        }
        if (angleLines.display) {
            ctx.save();
            for(i = labelCount - 1; i >= 0; i--){
                const optsAtIndex = angleLines.setContext(this.getPointLabelContext(i));
                const { color , lineWidth  } = optsAtIndex;
                if (!lineWidth || !color) {
                    continue;
                }
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = color;
                ctx.setLineDash(optsAtIndex.borderDash);
                ctx.lineDashOffset = optsAtIndex.borderDashOffset;
                offset = this.getDistanceFromCenterForValue(opts.ticks.reverse ? this.min : this.max);
                position = this.getPointPosition(i, offset);
                ctx.beginPath();
                ctx.moveTo(this.xCenter, this.yCenter);
                ctx.lineTo(position.x, position.y);
                ctx.stroke();
            }
            ctx.restore();
        }
    }
 drawBorder() {}
 drawLabels() {
        const ctx = this.ctx;
        const opts = this.options;
        const tickOpts = opts.ticks;
        if (!tickOpts.display) {
            return;
        }
        const startAngle = this.getIndexAngle(0);
        let offset, width;
        ctx.save();
        ctx.translate(this.xCenter, this.yCenter);
        ctx.rotate(startAngle);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        this.ticks.forEach((tick, index)=>{
            if (index === 0 && !opts.reverse) {
                return;
            }
            const optsAtIndex = tickOpts.setContext(this.getContext(index));
            const tickFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(optsAtIndex.font);
            offset = this.getDistanceFromCenterForValue(this.ticks[index].value);
            if (optsAtIndex.showLabelBackdrop) {
                ctx.font = tickFont.string;
                width = ctx.measureText(tick.label).width;
                ctx.fillStyle = optsAtIndex.backdropColor;
                const padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(optsAtIndex.backdropPadding);
                ctx.fillRect(-width / 2 - padding.left, -offset - tickFont.size / 2 - padding.top, width + padding.width, tickFont.size + padding.height);
            }
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, tick.label, 0, -offset, tickFont, {
                color: optsAtIndex.color,
                strokeColor: optsAtIndex.textStrokeColor,
                strokeWidth: optsAtIndex.textStrokeWidth
            });
        });
        ctx.restore();
    }
 drawTitle() {}
}

const INTERVALS = {
    millisecond: {
        common: true,
        size: 1,
        steps: 1000
    },
    second: {
        common: true,
        size: 1000,
        steps: 60
    },
    minute: {
        common: true,
        size: 60000,
        steps: 60
    },
    hour: {
        common: true,
        size: 3600000,
        steps: 24
    },
    day: {
        common: true,
        size: 86400000,
        steps: 30
    },
    week: {
        common: false,
        size: 604800000,
        steps: 4
    },
    month: {
        common: true,
        size: 2.628e9,
        steps: 12
    },
    quarter: {
        common: false,
        size: 7.884e9,
        steps: 4
    },
    year: {
        common: true,
        size: 3.154e10
    }
};
 const UNITS =  /* #__PURE__ */ Object.keys(INTERVALS);
 function sorter(a, b) {
    return a - b;
}
 function parse(scale, input) {
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(input)) {
        return null;
    }
    const adapter = scale._adapter;
    const { parser , round , isoWeekday  } = scale._parseOpts;
    let value = input;
    if (typeof parser === 'function') {
        value = parser(value);
    }
    if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(value)) {
        value = typeof parser === 'string' ? adapter.parse(value,  parser) : adapter.parse(value);
    }
    if (value === null) {
        return null;
    }
    if (round) {
        value = round === 'week' && ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x)(isoWeekday) || isoWeekday === true) ? adapter.startOf(value, 'isoWeek', isoWeekday) : adapter.startOf(value, round);
    }
    return +value;
}
 function determineUnitForAutoTicks(minUnit, min, max, capacity) {
    const ilen = UNITS.length;
    for(let i = UNITS.indexOf(minUnit); i < ilen - 1; ++i){
        const interval = INTERVALS[UNITS[i]];
        const factor = interval.steps ? interval.steps : Number.MAX_SAFE_INTEGER;
        if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
            return UNITS[i];
        }
    }
    return UNITS[ilen - 1];
}
 function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
    for(let i = UNITS.length - 1; i >= UNITS.indexOf(minUnit); i--){
        const unit = UNITS[i];
        if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) {
            return unit;
        }
    }
    return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
}
 function determineMajorUnit(unit) {
    for(let i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i){
        if (INTERVALS[UNITS[i]].common) {
            return UNITS[i];
        }
    }
}
 function addTick(ticks, time, timestamps) {
    if (!timestamps) {
        ticks[time] = true;
    } else if (timestamps.length) {
        const { lo , hi  } = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aP)(timestamps, time);
        const timestamp = timestamps[lo] >= time ? timestamps[lo] : timestamps[hi];
        ticks[timestamp] = true;
    }
}
 function setMajorTicks(scale, ticks, map, majorUnit) {
    const adapter = scale._adapter;
    const first = +adapter.startOf(ticks[0].value, majorUnit);
    const last = ticks[ticks.length - 1].value;
    let major, index;
    for(major = first; major <= last; major = +adapter.add(major, 1, majorUnit)){
        index = map[major];
        if (index >= 0) {
            ticks[index].major = true;
        }
    }
    return ticks;
}
 function ticksFromTimestamps(scale, values, majorUnit) {
    const ticks = [];
     const map = {};
    const ilen = values.length;
    let i, value;
    for(i = 0; i < ilen; ++i){
        value = values[i];
        map[value] = i;
        ticks.push({
            value,
            major: false
        });
    }
    return ilen === 0 || !majorUnit ? ticks : setMajorTicks(scale, ticks, map, majorUnit);
}
class TimeScale extends Scale {
    static id = 'time';
 static defaults = {
 bounds: 'data',
        adapters: {},
        time: {
            parser: false,
            unit: false,
            round: false,
            isoWeekday: false,
            minUnit: 'millisecond',
            displayFormats: {}
        },
        ticks: {
 source: 'auto',
            callback: false,
            major: {
                enabled: false
            }
        }
    };
 constructor(props){
        super(props);
         this._cache = {
            data: [],
            labels: [],
            all: []
        };
         this._unit = 'day';
         this._majorUnit = undefined;
        this._offsets = {};
        this._normalized = false;
        this._parseOpts = undefined;
    }
    init(scaleOpts, opts = {}) {
        const time = scaleOpts.time || (scaleOpts.time = {});
         const adapter = this._adapter = new adapters._date(scaleOpts.adapters.date);
        adapter.init(opts);
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ab)(time.displayFormats, adapter.formats());
        this._parseOpts = {
            parser: time.parser,
            round: time.round,
            isoWeekday: time.isoWeekday
        };
        super.init(scaleOpts);
        this._normalized = opts.normalized;
    }
 parse(raw, index) {
        if (raw === undefined) {
            return null;
        }
        return parse(this, raw);
    }
    beforeLayout() {
        super.beforeLayout();
        this._cache = {
            data: [],
            labels: [],
            all: []
        };
    }
    determineDataLimits() {
        const options = this.options;
        const adapter = this._adapter;
        const unit = options.time.unit || 'day';
        let { min , max , minDefined , maxDefined  } = this.getUserBounds();
 function _applyBounds(bounds) {
            if (!minDefined && !isNaN(bounds.min)) {
                min = Math.min(min, bounds.min);
            }
            if (!maxDefined && !isNaN(bounds.max)) {
                max = Math.max(max, bounds.max);
            }
        }
        if (!minDefined || !maxDefined) {
            _applyBounds(this._getLabelBounds());
            if (options.bounds !== 'ticks' || options.ticks.source !== 'labels') {
                _applyBounds(this.getMinMax(false));
            }
        }
        min = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit);
        max = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1;
        this.min = Math.min(min, max - 1);
        this.max = Math.max(min + 1, max);
    }
 _getLabelBounds() {
        const arr = this.getLabelTimestamps();
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        if (arr.length) {
            min = arr[0];
            max = arr[arr.length - 1];
        }
        return {
            min,
            max
        };
    }
 buildTicks() {
        const options = this.options;
        const timeOpts = options.time;
        const tickOpts = options.ticks;
        const timestamps = tickOpts.source === 'labels' ? this.getLabelTimestamps() : this._generate();
        if (options.bounds === 'ticks' && timestamps.length) {
            this.min = this._userMin || timestamps[0];
            this.max = this._userMax || timestamps[timestamps.length - 1];
        }
        const min = this.min;
        const max = this.max;
        const ticks = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aO)(timestamps, min, max);
        this._unit = timeOpts.unit || (tickOpts.autoSkip ? determineUnitForAutoTicks(timeOpts.minUnit, this.min, this.max, this._getLabelCapacity(min)) : determineUnitForFormatting(this, ticks.length, timeOpts.minUnit, this.min, this.max));
        this._majorUnit = !tickOpts.major.enabled || this._unit === 'year' ? undefined : determineMajorUnit(this._unit);
        this.initOffsets(timestamps);
        if (options.reverse) {
            ticks.reverse();
        }
        return ticksFromTimestamps(this, ticks, this._majorUnit);
    }
    afterAutoSkip() {
        if (this.options.offsetAfterAutoskip) {
            this.initOffsets(this.ticks.map((tick)=>+tick.value));
        }
    }
 initOffsets(timestamps = []) {
        let start = 0;
        let end = 0;
        let first, last;
        if (this.options.offset && timestamps.length) {
            first = this.getDecimalForValue(timestamps[0]);
            if (timestamps.length === 1) {
                start = 1 - first;
            } else {
                start = (this.getDecimalForValue(timestamps[1]) - first) / 2;
            }
            last = this.getDecimalForValue(timestamps[timestamps.length - 1]);
            if (timestamps.length === 1) {
                end = last;
            } else {
                end = (last - this.getDecimalForValue(timestamps[timestamps.length - 2])) / 2;
            }
        }
        const limit = timestamps.length < 3 ? 0.5 : 0.25;
        start = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(start, 0, limit);
        end = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(end, 0, limit);
        this._offsets = {
            start,
            end,
            factor: 1 / (start + 1 + end)
        };
    }
 _generate() {
        const adapter = this._adapter;
        const min = this.min;
        const max = this.max;
        const options = this.options;
        const timeOpts = options.time;
        const minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, this._getLabelCapacity(min));
        const stepSize = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(options.ticks.stepSize, 1);
        const weekday = minor === 'week' ? timeOpts.isoWeekday : false;
        const hasWeekday = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x)(weekday) || weekday === true;
        const ticks = {};
        let first = min;
        let time, count;
        if (hasWeekday) {
            first = +adapter.startOf(first, 'isoWeek', weekday);
        }
        first = +adapter.startOf(first, hasWeekday ? 'day' : minor);
        if (adapter.diff(max, min, minor) > 100000 * stepSize) {
            throw new Error(min + ' and ' + max + ' are too far apart with stepSize of ' + stepSize + ' ' + minor);
        }
        const timestamps = options.ticks.source === 'data' && this.getDataTimestamps();
        for(time = first, count = 0; time < max; time = +adapter.add(time, stepSize, minor), count++){
            addTick(ticks, time, timestamps);
        }
        if (time === max || options.bounds === 'ticks' || count === 1) {
            addTick(ticks, time, timestamps);
        }
        return Object.keys(ticks).sort(sorter).map((x)=>+x);
    }
 getLabelForValue(value) {
        const adapter = this._adapter;
        const timeOpts = this.options.time;
        if (timeOpts.tooltipFormat) {
            return adapter.format(value, timeOpts.tooltipFormat);
        }
        return adapter.format(value, timeOpts.displayFormats.datetime);
    }
 format(value, format) {
        const options = this.options;
        const formats = options.time.displayFormats;
        const unit = this._unit;
        const fmt = format || formats[unit];
        return this._adapter.format(value, fmt);
    }
 _tickFormatFunction(time, index, ticks, format) {
        const options = this.options;
        const formatter = options.ticks.callback;
        if (formatter) {
            return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(formatter, [
                time,
                index,
                ticks
            ], this);
        }
        const formats = options.time.displayFormats;
        const unit = this._unit;
        const majorUnit = this._majorUnit;
        const minorFormat = unit && formats[unit];
        const majorFormat = majorUnit && formats[majorUnit];
        const tick = ticks[index];
        const major = majorUnit && majorFormat && tick && tick.major;
        return this._adapter.format(time, format || (major ? majorFormat : minorFormat));
    }
 generateTickLabels(ticks) {
        let i, ilen, tick;
        for(i = 0, ilen = ticks.length; i < ilen; ++i){
            tick = ticks[i];
            tick.label = this._tickFormatFunction(tick.value, i, ticks);
        }
    }
 getDecimalForValue(value) {
        return value === null ? NaN : (value - this.min) / (this.max - this.min);
    }
 getPixelForValue(value) {
        const offsets = this._offsets;
        const pos = this.getDecimalForValue(value);
        return this.getPixelForDecimal((offsets.start + pos) * offsets.factor);
    }
 getValueForPixel(pixel) {
        const offsets = this._offsets;
        const pos = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
        return this.min + pos * (this.max - this.min);
    }
 _getLabelSize(label) {
        const ticksOpts = this.options.ticks;
        const tickLabelWidth = this.ctx.measureText(label).width;
        const angle = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
        const cosRotation = Math.cos(angle);
        const sinRotation = Math.sin(angle);
        const tickFontSize = this._resolveTickFontOptions(0).size;
        return {
            w: tickLabelWidth * cosRotation + tickFontSize * sinRotation,
            h: tickLabelWidth * sinRotation + tickFontSize * cosRotation
        };
    }
 _getLabelCapacity(exampleTime) {
        const timeOpts = this.options.time;
        const displayFormats = timeOpts.displayFormats;
        const format = displayFormats[timeOpts.unit] || displayFormats.millisecond;
        const exampleLabel = this._tickFormatFunction(exampleTime, 0, ticksFromTimestamps(this, [
            exampleTime
        ], this._majorUnit), format);
        const size = this._getLabelSize(exampleLabel);
        const capacity = Math.floor(this.isHorizontal() ? this.width / size.w : this.height / size.h) - 1;
        return capacity > 0 ? capacity : 1;
    }
 getDataTimestamps() {
        let timestamps = this._cache.data || [];
        let i, ilen;
        if (timestamps.length) {
            return timestamps;
        }
        const metas = this.getMatchingVisibleMetas();
        if (this._normalized && metas.length) {
            return this._cache.data = metas[0].controller.getAllParsedValues(this);
        }
        for(i = 0, ilen = metas.length; i < ilen; ++i){
            timestamps = timestamps.concat(metas[i].controller.getAllParsedValues(this));
        }
        return this._cache.data = this.normalize(timestamps);
    }
 getLabelTimestamps() {
        const timestamps = this._cache.labels || [];
        let i, ilen;
        if (timestamps.length) {
            return timestamps;
        }
        const labels = this.getLabels();
        for(i = 0, ilen = labels.length; i < ilen; ++i){
            timestamps.push(parse(this, labels[i]));
        }
        return this._cache.labels = this._normalized ? timestamps : this.normalize(timestamps);
    }
 normalize(values) {
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__._)(values.sort(sorter));
    }
}

function interpolate(table, val, reverse) {
    let lo = 0;
    let hi = table.length - 1;
    let prevSource, nextSource, prevTarget, nextTarget;
    if (reverse) {
        if (val >= table[lo].pos && val <= table[hi].pos) {
            ({ lo , hi  } = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.B)(table, 'pos', val));
        }
        ({ pos: prevSource , time: prevTarget  } = table[lo]);
        ({ pos: nextSource , time: nextTarget  } = table[hi]);
    } else {
        if (val >= table[lo].time && val <= table[hi].time) {
            ({ lo , hi  } = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.B)(table, 'time', val));
        }
        ({ time: prevSource , pos: prevTarget  } = table[lo]);
        ({ time: nextSource , pos: nextTarget  } = table[hi]);
    }
    const span = nextSource - prevSource;
    return span ? prevTarget + (nextTarget - prevTarget) * (val - prevSource) / span : prevTarget;
}
class TimeSeriesScale extends TimeScale {
    static id = 'timeseries';
 static defaults = TimeScale.defaults;
 constructor(props){
        super(props);
         this._table = [];
         this._minPos = undefined;
         this._tableRange = undefined;
    }
 initOffsets() {
        const timestamps = this._getTimestampsForTable();
        const table = this._table = this.buildLookupTable(timestamps);
        this._minPos = interpolate(table, this.min);
        this._tableRange = interpolate(table, this.max) - this._minPos;
        super.initOffsets(timestamps);
    }
 buildLookupTable(timestamps) {
        const { min , max  } = this;
        const items = [];
        const table = [];
        let i, ilen, prev, curr, next;
        for(i = 0, ilen = timestamps.length; i < ilen; ++i){
            curr = timestamps[i];
            if (curr >= min && curr <= max) {
                items.push(curr);
            }
        }
        if (items.length < 2) {
            return [
                {
                    time: min,
                    pos: 0
                },
                {
                    time: max,
                    pos: 1
                }
            ];
        }
        for(i = 0, ilen = items.length; i < ilen; ++i){
            next = items[i + 1];
            prev = items[i - 1];
            curr = items[i];
            if (Math.round((next + prev) / 2) !== curr) {
                table.push({
                    time: curr,
                    pos: i / (ilen - 1)
                });
            }
        }
        return table;
    }
 _generate() {
        const min = this.min;
        const max = this.max;
        let timestamps = super.getDataTimestamps();
        if (!timestamps.includes(min) || !timestamps.length) {
            timestamps.splice(0, 0, min);
        }
        if (!timestamps.includes(max) || timestamps.length === 1) {
            timestamps.push(max);
        }
        return timestamps.sort((a, b)=>a - b);
    }
 _getTimestampsForTable() {
        let timestamps = this._cache.all || [];
        if (timestamps.length) {
            return timestamps;
        }
        const data = this.getDataTimestamps();
        const label = this.getLabelTimestamps();
        if (data.length && label.length) {
            timestamps = this.normalize(data.concat(label));
        } else {
            timestamps = data.length ? data : label;
        }
        timestamps = this._cache.all = timestamps;
        return timestamps;
    }
 getDecimalForValue(value) {
        return (interpolate(this._table, value) - this._minPos) / this._tableRange;
    }
 getValueForPixel(pixel) {
        const offsets = this._offsets;
        const decimal = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
        return interpolate(this._table, decimal * this._tableRange + this._minPos, true);
    }
}

var scales = /*#__PURE__*/Object.freeze({
__proto__: null,
CategoryScale: CategoryScale,
LinearScale: LinearScale,
LogarithmicScale: LogarithmicScale,
RadialLinearScale: RadialLinearScale,
TimeScale: TimeScale,
TimeSeriesScale: TimeSeriesScale
});

const registerables = [
    controllers,
    elements,
    plugins,
    scales
];


//# sourceMappingURL=chart.js.map


/***/ }),

/***/ "./node_modules/chart.js/dist/chunks/helpers.segment.js":
/*!**************************************************************!*\
  !*** ./node_modules/chart.js/dist/chunks/helpers.segment.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $: () => (/* binding */ unclipArea),
/* harmony export */   A: () => (/* binding */ _rlookupByKey),
/* harmony export */   B: () => (/* binding */ _lookupByKey),
/* harmony export */   C: () => (/* binding */ _isPointInArea),
/* harmony export */   D: () => (/* binding */ getAngleFromPoint),
/* harmony export */   E: () => (/* binding */ toPadding),
/* harmony export */   F: () => (/* binding */ each),
/* harmony export */   G: () => (/* binding */ getMaximumSize),
/* harmony export */   H: () => (/* binding */ HALF_PI),
/* harmony export */   I: () => (/* binding */ _getParentNode),
/* harmony export */   J: () => (/* binding */ readUsedSize),
/* harmony export */   K: () => (/* binding */ supportsEventListenerOptions),
/* harmony export */   L: () => (/* binding */ throttled),
/* harmony export */   M: () => (/* binding */ _isDomSupported),
/* harmony export */   N: () => (/* binding */ _factorize),
/* harmony export */   O: () => (/* binding */ finiteOrDefault),
/* harmony export */   P: () => (/* binding */ PI),
/* harmony export */   Q: () => (/* binding */ callback),
/* harmony export */   R: () => (/* binding */ _addGrace),
/* harmony export */   S: () => (/* binding */ _limitValue),
/* harmony export */   T: () => (/* binding */ TAU),
/* harmony export */   U: () => (/* binding */ toDegrees),
/* harmony export */   V: () => (/* binding */ _measureText),
/* harmony export */   W: () => (/* binding */ _int16Range),
/* harmony export */   X: () => (/* binding */ _alignPixel),
/* harmony export */   Y: () => (/* binding */ clipArea),
/* harmony export */   Z: () => (/* binding */ renderText),
/* harmony export */   _: () => (/* binding */ _arrayUnique),
/* harmony export */   a: () => (/* binding */ resolve),
/* harmony export */   a$: () => (/* binding */ fontString),
/* harmony export */   a0: () => (/* binding */ toFont),
/* harmony export */   a1: () => (/* binding */ _toLeftRightCenter),
/* harmony export */   a2: () => (/* binding */ _alignStartEnd),
/* harmony export */   a3: () => (/* binding */ overrides),
/* harmony export */   a4: () => (/* binding */ merge),
/* harmony export */   a5: () => (/* binding */ _capitalize),
/* harmony export */   a6: () => (/* binding */ descriptors),
/* harmony export */   a7: () => (/* binding */ isFunction),
/* harmony export */   a8: () => (/* binding */ _attachContext),
/* harmony export */   a9: () => (/* binding */ _createResolver),
/* harmony export */   aA: () => (/* binding */ overrideTextDirection),
/* harmony export */   aB: () => (/* binding */ _textX),
/* harmony export */   aC: () => (/* binding */ restoreTextDirection),
/* harmony export */   aD: () => (/* binding */ drawPointLegend),
/* harmony export */   aE: () => (/* binding */ distanceBetweenPoints),
/* harmony export */   aF: () => (/* binding */ noop),
/* harmony export */   aG: () => (/* binding */ _setMinAndMaxByKey),
/* harmony export */   aH: () => (/* binding */ niceNum),
/* harmony export */   aI: () => (/* binding */ almostWhole),
/* harmony export */   aJ: () => (/* binding */ almostEquals),
/* harmony export */   aK: () => (/* binding */ _decimalPlaces),
/* harmony export */   aL: () => (/* binding */ Ticks),
/* harmony export */   aM: () => (/* binding */ log10),
/* harmony export */   aN: () => (/* binding */ _longestText),
/* harmony export */   aO: () => (/* binding */ _filterBetween),
/* harmony export */   aP: () => (/* binding */ _lookup),
/* harmony export */   aQ: () => (/* binding */ isPatternOrGradient),
/* harmony export */   aR: () => (/* binding */ getHoverColor),
/* harmony export */   aS: () => (/* binding */ clone),
/* harmony export */   aT: () => (/* binding */ _merger),
/* harmony export */   aU: () => (/* binding */ _mergerIf),
/* harmony export */   aV: () => (/* binding */ _deprecated),
/* harmony export */   aW: () => (/* binding */ _splitKey),
/* harmony export */   aX: () => (/* binding */ toFontString),
/* harmony export */   aY: () => (/* binding */ splineCurve),
/* harmony export */   aZ: () => (/* binding */ splineCurveMonotone),
/* harmony export */   a_: () => (/* binding */ getStyle),
/* harmony export */   aa: () => (/* binding */ _descriptors),
/* harmony export */   ab: () => (/* binding */ mergeIf),
/* harmony export */   ac: () => (/* binding */ uid),
/* harmony export */   ad: () => (/* binding */ debounce),
/* harmony export */   ae: () => (/* binding */ retinaScale),
/* harmony export */   af: () => (/* binding */ clearCanvas),
/* harmony export */   ag: () => (/* binding */ setsEqual),
/* harmony export */   ah: () => (/* binding */ _elementsEqual),
/* harmony export */   ai: () => (/* binding */ _isClickEvent),
/* harmony export */   aj: () => (/* binding */ _isBetween),
/* harmony export */   ak: () => (/* binding */ _readValueToProps),
/* harmony export */   al: () => (/* binding */ _updateBezierControlPoints),
/* harmony export */   am: () => (/* binding */ _computeSegments),
/* harmony export */   an: () => (/* binding */ _boundSegments),
/* harmony export */   ao: () => (/* binding */ _steppedInterpolation),
/* harmony export */   ap: () => (/* binding */ _bezierInterpolation),
/* harmony export */   aq: () => (/* binding */ _pointInLine),
/* harmony export */   ar: () => (/* binding */ _steppedLineTo),
/* harmony export */   as: () => (/* binding */ _bezierCurveTo),
/* harmony export */   at: () => (/* binding */ drawPoint),
/* harmony export */   au: () => (/* binding */ addRoundedRectPath),
/* harmony export */   av: () => (/* binding */ toTRBL),
/* harmony export */   aw: () => (/* binding */ toTRBLCorners),
/* harmony export */   ax: () => (/* binding */ _boundSegment),
/* harmony export */   ay: () => (/* binding */ _normalizeAngle),
/* harmony export */   az: () => (/* binding */ getRtlAdapter),
/* harmony export */   b: () => (/* binding */ isArray),
/* harmony export */   b0: () => (/* binding */ toLineHeight),
/* harmony export */   b1: () => (/* binding */ PITAU),
/* harmony export */   b2: () => (/* binding */ INFINITY),
/* harmony export */   b3: () => (/* binding */ RAD_PER_DEG),
/* harmony export */   b4: () => (/* binding */ QUARTER_PI),
/* harmony export */   b5: () => (/* binding */ TWO_THIRDS_PI),
/* harmony export */   b6: () => (/* binding */ _angleDiff),
/* harmony export */   c: () => (/* binding */ color),
/* harmony export */   d: () => (/* binding */ defaults),
/* harmony export */   e: () => (/* binding */ effects),
/* harmony export */   f: () => (/* binding */ resolveObjectKey),
/* harmony export */   g: () => (/* binding */ isNumberFinite),
/* harmony export */   h: () => (/* binding */ defined),
/* harmony export */   i: () => (/* binding */ isObject),
/* harmony export */   j: () => (/* binding */ createContext),
/* harmony export */   k: () => (/* binding */ isNullOrUndef),
/* harmony export */   l: () => (/* binding */ listenArrayEvents),
/* harmony export */   m: () => (/* binding */ toPercentage),
/* harmony export */   n: () => (/* binding */ toDimension),
/* harmony export */   o: () => (/* binding */ formatNumber),
/* harmony export */   p: () => (/* binding */ _angleBetween),
/* harmony export */   q: () => (/* binding */ _getStartAndCountOfVisiblePoints),
/* harmony export */   r: () => (/* binding */ requestAnimFrame),
/* harmony export */   s: () => (/* binding */ sign),
/* harmony export */   t: () => (/* binding */ toRadians),
/* harmony export */   u: () => (/* binding */ unlistenArrayEvents),
/* harmony export */   v: () => (/* binding */ valueOrDefault),
/* harmony export */   w: () => (/* binding */ _scaleRangesChanged),
/* harmony export */   x: () => (/* binding */ isNumber),
/* harmony export */   y: () => (/* binding */ _parseObjectDataRadialScale),
/* harmony export */   z: () => (/* binding */ getRelativePosition)
/* harmony export */ });
/* harmony import */ var _kurkle_color__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @kurkle/color */ "./node_modules/@kurkle/color/dist/color.esm.js");
/*!
 * Chart.js v4.4.1
 * https://www.chartjs.org
 * (c) 2023 Chart.js Contributors
 * Released under the MIT License
 */


/**
 * @namespace Chart.helpers
 */ /**
 * An empty function that can be used, for example, for optional callback.
 */ function noop() {
/* noop */ }
/**
 * Returns a unique id, sequentially generated from a global variable.
 */ const uid = (()=>{
    let id = 0;
    return ()=>id++;
})();
/**
 * Returns true if `value` is neither null nor undefined, else returns false.
 * @param value - The value to test.
 * @since 2.7.0
 */ function isNullOrUndef(value) {
    return value === null || typeof value === 'undefined';
}
/**
 * Returns true if `value` is an array (including typed arrays), else returns false.
 * @param value - The value to test.
 * @function
 */ function isArray(value) {
    if (Array.isArray && Array.isArray(value)) {
        return true;
    }
    const type = Object.prototype.toString.call(value);
    if (type.slice(0, 7) === '[object' && type.slice(-6) === 'Array]') {
        return true;
    }
    return false;
}
/**
 * Returns true if `value` is an object (excluding null), else returns false.
 * @param value - The value to test.
 * @since 2.7.0
 */ function isObject(value) {
    return value !== null && Object.prototype.toString.call(value) === '[object Object]';
}
/**
 * Returns true if `value` is a finite number, else returns false
 * @param value  - The value to test.
 */ function isNumberFinite(value) {
    return (typeof value === 'number' || value instanceof Number) && isFinite(+value);
}
/**
 * Returns `value` if finite, else returns `defaultValue`.
 * @param value - The value to return if defined.
 * @param defaultValue - The value to return if `value` is not finite.
 */ function finiteOrDefault(value, defaultValue) {
    return isNumberFinite(value) ? value : defaultValue;
}
/**
 * Returns `value` if defined, else returns `defaultValue`.
 * @param value - The value to return if defined.
 * @param defaultValue - The value to return if `value` is undefined.
 */ function valueOrDefault(value, defaultValue) {
    return typeof value === 'undefined' ? defaultValue : value;
}
const toPercentage = (value, dimension)=>typeof value === 'string' && value.endsWith('%') ? parseFloat(value) / 100 : +value / dimension;
const toDimension = (value, dimension)=>typeof value === 'string' && value.endsWith('%') ? parseFloat(value) / 100 * dimension : +value;
/**
 * Calls `fn` with the given `args` in the scope defined by `thisArg` and returns the
 * value returned by `fn`. If `fn` is not a function, this method returns undefined.
 * @param fn - The function to call.
 * @param args - The arguments with which `fn` should be called.
 * @param [thisArg] - The value of `this` provided for the call to `fn`.
 */ function callback(fn, args, thisArg) {
    if (fn && typeof fn.call === 'function') {
        return fn.apply(thisArg, args);
    }
}
function each(loopable, fn, thisArg, reverse) {
    let i, len, keys;
    if (isArray(loopable)) {
        len = loopable.length;
        if (reverse) {
            for(i = len - 1; i >= 0; i--){
                fn.call(thisArg, loopable[i], i);
            }
        } else {
            for(i = 0; i < len; i++){
                fn.call(thisArg, loopable[i], i);
            }
        }
    } else if (isObject(loopable)) {
        keys = Object.keys(loopable);
        len = keys.length;
        for(i = 0; i < len; i++){
            fn.call(thisArg, loopable[keys[i]], keys[i]);
        }
    }
}
/**
 * Returns true if the `a0` and `a1` arrays have the same content, else returns false.
 * @param a0 - The array to compare
 * @param a1 - The array to compare
 * @private
 */ function _elementsEqual(a0, a1) {
    let i, ilen, v0, v1;
    if (!a0 || !a1 || a0.length !== a1.length) {
        return false;
    }
    for(i = 0, ilen = a0.length; i < ilen; ++i){
        v0 = a0[i];
        v1 = a1[i];
        if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
            return false;
        }
    }
    return true;
}
/**
 * Returns a deep copy of `source` without keeping references on objects and arrays.
 * @param source - The value to clone.
 */ function clone(source) {
    if (isArray(source)) {
        return source.map(clone);
    }
    if (isObject(source)) {
        const target = Object.create(null);
        const keys = Object.keys(source);
        const klen = keys.length;
        let k = 0;
        for(; k < klen; ++k){
            target[keys[k]] = clone(source[keys[k]]);
        }
        return target;
    }
    return source;
}
function isValidKey(key) {
    return [
        '__proto__',
        'prototype',
        'constructor'
    ].indexOf(key) === -1;
}
/**
 * The default merger when Chart.helpers.merge is called without merger option.
 * Note(SB): also used by mergeConfig and mergeScaleConfig as fallback.
 * @private
 */ function _merger(key, target, source, options) {
    if (!isValidKey(key)) {
        return;
    }
    const tval = target[key];
    const sval = source[key];
    if (isObject(tval) && isObject(sval)) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        merge(tval, sval, options);
    } else {
        target[key] = clone(sval);
    }
}
function merge(target, source, options) {
    const sources = isArray(source) ? source : [
        source
    ];
    const ilen = sources.length;
    if (!isObject(target)) {
        return target;
    }
    options = options || {};
    const merger = options.merger || _merger;
    let current;
    for(let i = 0; i < ilen; ++i){
        current = sources[i];
        if (!isObject(current)) {
            continue;
        }
        const keys = Object.keys(current);
        for(let k = 0, klen = keys.length; k < klen; ++k){
            merger(keys[k], target, current, options);
        }
    }
    return target;
}
function mergeIf(target, source) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return merge(target, source, {
        merger: _mergerIf
    });
}
/**
 * Merges source[key] in target[key] only if target[key] is undefined.
 * @private
 */ function _mergerIf(key, target, source) {
    if (!isValidKey(key)) {
        return;
    }
    const tval = target[key];
    const sval = source[key];
    if (isObject(tval) && isObject(sval)) {
        mergeIf(tval, sval);
    } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
        target[key] = clone(sval);
    }
}
/**
 * @private
 */ function _deprecated(scope, value, previous, current) {
    if (value !== undefined) {
        console.warn(scope + ': "' + previous + '" is deprecated. Please use "' + current + '" instead');
    }
}
// resolveObjectKey resolver cache
const keyResolvers = {
    // Chart.helpers.core resolveObjectKey should resolve empty key to root object
    '': (v)=>v,
    // default resolvers
    x: (o)=>o.x,
    y: (o)=>o.y
};
/**
 * @private
 */ function _splitKey(key) {
    const parts = key.split('.');
    const keys = [];
    let tmp = '';
    for (const part of parts){
        tmp += part;
        if (tmp.endsWith('\\')) {
            tmp = tmp.slice(0, -1) + '.';
        } else {
            keys.push(tmp);
            tmp = '';
        }
    }
    return keys;
}
function _getKeyResolver(key) {
    const keys = _splitKey(key);
    return (obj)=>{
        for (const k of keys){
            if (k === '') {
                break;
            }
            obj = obj && obj[k];
        }
        return obj;
    };
}
function resolveObjectKey(obj, key) {
    const resolver = keyResolvers[key] || (keyResolvers[key] = _getKeyResolver(key));
    return resolver(obj);
}
/**
 * @private
 */ function _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
const defined = (value)=>typeof value !== 'undefined';
const isFunction = (value)=>typeof value === 'function';
// Adapted from https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality#31129384
const setsEqual = (a, b)=>{
    if (a.size !== b.size) {
        return false;
    }
    for (const item of a){
        if (!b.has(item)) {
            return false;
        }
    }
    return true;
};
/**
 * @param e - The event
 * @private
 */ function _isClickEvent(e) {
    return e.type === 'mouseup' || e.type === 'click' || e.type === 'contextmenu';
}

/**
 * @alias Chart.helpers.math
 * @namespace
 */ const PI = Math.PI;
const TAU = 2 * PI;
const PITAU = TAU + PI;
const INFINITY = Number.POSITIVE_INFINITY;
const RAD_PER_DEG = PI / 180;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_THIRDS_PI = PI * 2 / 3;
const log10 = Math.log10;
const sign = Math.sign;
function almostEquals(x, y, epsilon) {
    return Math.abs(x - y) < epsilon;
}
/**
 * Implementation of the nice number algorithm used in determining where axis labels will go
 */ function niceNum(range) {
    const roundedRange = Math.round(range);
    range = almostEquals(range, roundedRange, range / 1000) ? roundedRange : range;
    const niceRange = Math.pow(10, Math.floor(log10(range)));
    const fraction = range / niceRange;
    const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
    return niceFraction * niceRange;
}
/**
 * Returns an array of factors sorted from 1 to sqrt(value)
 * @private
 */ function _factorize(value) {
    const result = [];
    const sqrt = Math.sqrt(value);
    let i;
    for(i = 1; i < sqrt; i++){
        if (value % i === 0) {
            result.push(i);
            result.push(value / i);
        }
    }
    if (sqrt === (sqrt | 0)) {
        result.push(sqrt);
    }
    result.sort((a, b)=>a - b).pop();
    return result;
}
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function almostWhole(x, epsilon) {
    const rounded = Math.round(x);
    return rounded - epsilon <= x && rounded + epsilon >= x;
}
/**
 * @private
 */ function _setMinAndMaxByKey(array, target, property) {
    let i, ilen, value;
    for(i = 0, ilen = array.length; i < ilen; i++){
        value = array[i][property];
        if (!isNaN(value)) {
            target.min = Math.min(target.min, value);
            target.max = Math.max(target.max, value);
        }
    }
}
function toRadians(degrees) {
    return degrees * (PI / 180);
}
function toDegrees(radians) {
    return radians * (180 / PI);
}
/**
 * Returns the number of decimal places
 * i.e. the number of digits after the decimal point, of the value of this Number.
 * @param x - A number.
 * @returns The number of decimal places.
 * @private
 */ function _decimalPlaces(x) {
    if (!isNumberFinite(x)) {
        return;
    }
    let e = 1;
    let p = 0;
    while(Math.round(x * e) / e !== x){
        e *= 10;
        p++;
    }
    return p;
}
// Gets the angle from vertical upright to the point about a centre.
function getAngleFromPoint(centrePoint, anglePoint) {
    const distanceFromXCenter = anglePoint.x - centrePoint.x;
    const distanceFromYCenter = anglePoint.y - centrePoint.y;
    const radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);
    let angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);
    if (angle < -0.5 * PI) {
        angle += TAU; // make sure the returned angle is in the range of (-PI/2, 3PI/2]
    }
    return {
        angle,
        distance: radialDistanceFromCenter
    };
}
function distanceBetweenPoints(pt1, pt2) {
    return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}
/**
 * Shortest distance between angles, in either direction.
 * @private
 */ function _angleDiff(a, b) {
    return (a - b + PITAU) % TAU - PI;
}
/**
 * Normalize angle to be between 0 and 2*PI
 * @private
 */ function _normalizeAngle(a) {
    return (a % TAU + TAU) % TAU;
}
/**
 * @private
 */ function _angleBetween(angle, start, end, sameAngleIsFullCircle) {
    const a = _normalizeAngle(angle);
    const s = _normalizeAngle(start);
    const e = _normalizeAngle(end);
    const angleToStart = _normalizeAngle(s - a);
    const angleToEnd = _normalizeAngle(e - a);
    const startToAngle = _normalizeAngle(a - s);
    const endToAngle = _normalizeAngle(a - e);
    return a === s || a === e || sameAngleIsFullCircle && s === e || angleToStart > angleToEnd && startToAngle < endToAngle;
}
/**
 * Limit `value` between `min` and `max`
 * @param value
 * @param min
 * @param max
 * @private
 */ function _limitValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/**
 * @param {number} value
 * @private
 */ function _int16Range(value) {
    return _limitValue(value, -32768, 32767);
}
/**
 * @param value
 * @param start
 * @param end
 * @param [epsilon]
 * @private
 */ function _isBetween(value, start, end, epsilon = 1e-6) {
    return value >= Math.min(start, end) - epsilon && value <= Math.max(start, end) + epsilon;
}

function _lookup(table, value, cmp) {
    cmp = cmp || ((index)=>table[index] < value);
    let hi = table.length - 1;
    let lo = 0;
    let mid;
    while(hi - lo > 1){
        mid = lo + hi >> 1;
        if (cmp(mid)) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    return {
        lo,
        hi
    };
}
/**
 * Binary search
 * @param table - the table search. must be sorted!
 * @param key - property name for the value in each entry
 * @param value - value to find
 * @param last - lookup last index
 * @private
 */ const _lookupByKey = (table, key, value, last)=>_lookup(table, value, last ? (index)=>{
        const ti = table[index][key];
        return ti < value || ti === value && table[index + 1][key] === value;
    } : (index)=>table[index][key] < value);
/**
 * Reverse binary search
 * @param table - the table search. must be sorted!
 * @param key - property name for the value in each entry
 * @param value - value to find
 * @private
 */ const _rlookupByKey = (table, key, value)=>_lookup(table, value, (index)=>table[index][key] >= value);
/**
 * Return subset of `values` between `min` and `max` inclusive.
 * Values are assumed to be in sorted order.
 * @param values - sorted array of values
 * @param min - min value
 * @param max - max value
 */ function _filterBetween(values, min, max) {
    let start = 0;
    let end = values.length;
    while(start < end && values[start] < min){
        start++;
    }
    while(end > start && values[end - 1] > max){
        end--;
    }
    return start > 0 || end < values.length ? values.slice(start, end) : values;
}
const arrayEvents = [
    'push',
    'pop',
    'shift',
    'splice',
    'unshift'
];
function listenArrayEvents(array, listener) {
    if (array._chartjs) {
        array._chartjs.listeners.push(listener);
        return;
    }
    Object.defineProperty(array, '_chartjs', {
        configurable: true,
        enumerable: false,
        value: {
            listeners: [
                listener
            ]
        }
    });
    arrayEvents.forEach((key)=>{
        const method = '_onData' + _capitalize(key);
        const base = array[key];
        Object.defineProperty(array, key, {
            configurable: true,
            enumerable: false,
            value (...args) {
                const res = base.apply(this, args);
                array._chartjs.listeners.forEach((object)=>{
                    if (typeof object[method] === 'function') {
                        object[method](...args);
                    }
                });
                return res;
            }
        });
    });
}
function unlistenArrayEvents(array, listener) {
    const stub = array._chartjs;
    if (!stub) {
        return;
    }
    const listeners = stub.listeners;
    const index = listeners.indexOf(listener);
    if (index !== -1) {
        listeners.splice(index, 1);
    }
    if (listeners.length > 0) {
        return;
    }
    arrayEvents.forEach((key)=>{
        delete array[key];
    });
    delete array._chartjs;
}
/**
 * @param items
 */ function _arrayUnique(items) {
    const set = new Set(items);
    if (set.size === items.length) {
        return items;
    }
    return Array.from(set);
}

function fontString(pixelSize, fontStyle, fontFamily) {
    return fontStyle + ' ' + pixelSize + 'px ' + fontFamily;
}
/**
* Request animation polyfill
*/ const requestAnimFrame = function() {
    if (typeof window === 'undefined') {
        return function(callback) {
            return callback();
        };
    }
    return window.requestAnimationFrame;
}();
/**
 * Throttles calling `fn` once per animation frame
 * Latest arguments are used on the actual call
 */ function throttled(fn, thisArg) {
    let argsToUse = [];
    let ticking = false;
    return function(...args) {
        // Save the args for use later
        argsToUse = args;
        if (!ticking) {
            ticking = true;
            requestAnimFrame.call(window, ()=>{
                ticking = false;
                fn.apply(thisArg, argsToUse);
            });
        }
    };
}
/**
 * Debounces calling `fn` for `delay` ms
 */ function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        if (delay) {
            clearTimeout(timeout);
            timeout = setTimeout(fn, delay, args);
        } else {
            fn.apply(this, args);
        }
        return delay;
    };
}
/**
 * Converts 'start' to 'left', 'end' to 'right' and others to 'center'
 * @private
 */ const _toLeftRightCenter = (align)=>align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
/**
 * Returns `start`, `end` or `(start + end) / 2` depending on `align`. Defaults to `center`
 * @private
 */ const _alignStartEnd = (align, start, end)=>align === 'start' ? start : align === 'end' ? end : (start + end) / 2;
/**
 * Returns `left`, `right` or `(left + right) / 2` depending on `align`. Defaults to `left`
 * @private
 */ const _textX = (align, left, right, rtl)=>{
    const check = rtl ? 'left' : 'right';
    return align === check ? right : align === 'center' ? (left + right) / 2 : left;
};
/**
 * Return start and count of visible points.
 * @private
 */ function _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled) {
    const pointCount = points.length;
    let start = 0;
    let count = pointCount;
    if (meta._sorted) {
        const { iScale , _parsed  } = meta;
        const axis = iScale.axis;
        const { min , max , minDefined , maxDefined  } = iScale.getUserBounds();
        if (minDefined) {
            start = _limitValue(Math.min(// @ts-expect-error Need to type _parsed
            _lookupByKey(_parsed, axis, min).lo, // @ts-expect-error Need to fix types on _lookupByKey
            animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo), 0, pointCount - 1);
        }
        if (maxDefined) {
            count = _limitValue(Math.max(// @ts-expect-error Need to type _parsed
            _lookupByKey(_parsed, iScale.axis, max, true).hi + 1, // @ts-expect-error Need to fix types on _lookupByKey
            animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max), true).hi + 1), start, pointCount) - start;
        } else {
            count = pointCount - start;
        }
    }
    return {
        start,
        count
    };
}
/**
 * Checks if the scale ranges have changed.
 * @param {object} meta - dataset meta.
 * @returns {boolean}
 * @private
 */ function _scaleRangesChanged(meta) {
    const { xScale , yScale , _scaleRanges  } = meta;
    const newRanges = {
        xmin: xScale.min,
        xmax: xScale.max,
        ymin: yScale.min,
        ymax: yScale.max
    };
    if (!_scaleRanges) {
        meta._scaleRanges = newRanges;
        return true;
    }
    const changed = _scaleRanges.xmin !== xScale.min || _scaleRanges.xmax !== xScale.max || _scaleRanges.ymin !== yScale.min || _scaleRanges.ymax !== yScale.max;
    Object.assign(_scaleRanges, newRanges);
    return changed;
}

const atEdge = (t)=>t === 0 || t === 1;
const elasticIn = (t, s, p)=>-(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * TAU / p));
const elasticOut = (t, s, p)=>Math.pow(2, -10 * t) * Math.sin((t - s) * TAU / p) + 1;
/**
 * Easing functions adapted from Robert Penner's easing equations.
 * @namespace Chart.helpers.easing.effects
 * @see http://www.robertpenner.com/easing/
 */ const effects = {
    linear: (t)=>t,
    easeInQuad: (t)=>t * t,
    easeOutQuad: (t)=>-t * (t - 2),
    easeInOutQuad: (t)=>(t /= 0.5) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1),
    easeInCubic: (t)=>t * t * t,
    easeOutCubic: (t)=>(t -= 1) * t * t + 1,
    easeInOutCubic: (t)=>(t /= 0.5) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2),
    easeInQuart: (t)=>t * t * t * t,
    easeOutQuart: (t)=>-((t -= 1) * t * t * t - 1),
    easeInOutQuart: (t)=>(t /= 0.5) < 1 ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2),
    easeInQuint: (t)=>t * t * t * t * t,
    easeOutQuint: (t)=>(t -= 1) * t * t * t * t + 1,
    easeInOutQuint: (t)=>(t /= 0.5) < 1 ? 0.5 * t * t * t * t * t : 0.5 * ((t -= 2) * t * t * t * t + 2),
    easeInSine: (t)=>-Math.cos(t * HALF_PI) + 1,
    easeOutSine: (t)=>Math.sin(t * HALF_PI),
    easeInOutSine: (t)=>-0.5 * (Math.cos(PI * t) - 1),
    easeInExpo: (t)=>t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    easeOutExpo: (t)=>t === 1 ? 1 : -Math.pow(2, -10 * t) + 1,
    easeInOutExpo: (t)=>atEdge(t) ? t : t < 0.5 ? 0.5 * Math.pow(2, 10 * (t * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (t * 2 - 1)) + 2),
    easeInCirc: (t)=>t >= 1 ? t : -(Math.sqrt(1 - t * t) - 1),
    easeOutCirc: (t)=>Math.sqrt(1 - (t -= 1) * t),
    easeInOutCirc: (t)=>(t /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1),
    easeInElastic: (t)=>atEdge(t) ? t : elasticIn(t, 0.075, 0.3),
    easeOutElastic: (t)=>atEdge(t) ? t : elasticOut(t, 0.075, 0.3),
    easeInOutElastic (t) {
        const s = 0.1125;
        const p = 0.45;
        return atEdge(t) ? t : t < 0.5 ? 0.5 * elasticIn(t * 2, s, p) : 0.5 + 0.5 * elasticOut(t * 2 - 1, s, p);
    },
    easeInBack (t) {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
    },
    easeOutBack (t) {
        const s = 1.70158;
        return (t -= 1) * t * ((s + 1) * t + s) + 1;
    },
    easeInOutBack (t) {
        let s = 1.70158;
        if ((t /= 0.5) < 1) {
            return 0.5 * (t * t * (((s *= 1.525) + 1) * t - s));
        }
        return 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
    },
    easeInBounce: (t)=>1 - effects.easeOutBounce(1 - t),
    easeOutBounce (t) {
        const m = 7.5625;
        const d = 2.75;
        if (t < 1 / d) {
            return m * t * t;
        }
        if (t < 2 / d) {
            return m * (t -= 1.5 / d) * t + 0.75;
        }
        if (t < 2.5 / d) {
            return m * (t -= 2.25 / d) * t + 0.9375;
        }
        return m * (t -= 2.625 / d) * t + 0.984375;
    },
    easeInOutBounce: (t)=>t < 0.5 ? effects.easeInBounce(t * 2) * 0.5 : effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5
};

function isPatternOrGradient(value) {
    if (value && typeof value === 'object') {
        const type = value.toString();
        return type === '[object CanvasPattern]' || type === '[object CanvasGradient]';
    }
    return false;
}
function color(value) {
    return isPatternOrGradient(value) ? value : new _kurkle_color__WEBPACK_IMPORTED_MODULE_0__.Color(value);
}
function getHoverColor(value) {
    return isPatternOrGradient(value) ? value : new _kurkle_color__WEBPACK_IMPORTED_MODULE_0__.Color(value).saturate(0.5).darken(0.1).hexString();
}

const numbers = [
    'x',
    'y',
    'borderWidth',
    'radius',
    'tension'
];
const colors = [
    'color',
    'borderColor',
    'backgroundColor'
];
function applyAnimationsDefaults(defaults) {
    defaults.set('animation', {
        delay: undefined,
        duration: 1000,
        easing: 'easeOutQuart',
        fn: undefined,
        from: undefined,
        loop: undefined,
        to: undefined,
        type: undefined
    });
    defaults.describe('animation', {
        _fallback: false,
        _indexable: false,
        _scriptable: (name)=>name !== 'onProgress' && name !== 'onComplete' && name !== 'fn'
    });
    defaults.set('animations', {
        colors: {
            type: 'color',
            properties: colors
        },
        numbers: {
            type: 'number',
            properties: numbers
        }
    });
    defaults.describe('animations', {
        _fallback: 'animation'
    });
    defaults.set('transitions', {
        active: {
            animation: {
                duration: 400
            }
        },
        resize: {
            animation: {
                duration: 0
            }
        },
        show: {
            animations: {
                colors: {
                    from: 'transparent'
                },
                visible: {
                    type: 'boolean',
                    duration: 0
                }
            }
        },
        hide: {
            animations: {
                colors: {
                    to: 'transparent'
                },
                visible: {
                    type: 'boolean',
                    easing: 'linear',
                    fn: (v)=>v | 0
                }
            }
        }
    });
}

function applyLayoutsDefaults(defaults) {
    defaults.set('layout', {
        autoPadding: true,
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    });
}

const intlCache = new Map();
function getNumberFormat(locale, options) {
    options = options || {};
    const cacheKey = locale + JSON.stringify(options);
    let formatter = intlCache.get(cacheKey);
    if (!formatter) {
        formatter = new Intl.NumberFormat(locale, options);
        intlCache.set(cacheKey, formatter);
    }
    return formatter;
}
function formatNumber(num, locale, options) {
    return getNumberFormat(locale, options).format(num);
}

const formatters = {
 values (value) {
        return isArray(value) ?  value : '' + value;
    },
 numeric (tickValue, index, ticks) {
        if (tickValue === 0) {
            return '0';
        }
        const locale = this.chart.options.locale;
        let notation;
        let delta = tickValue;
        if (ticks.length > 1) {
            const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
            if (maxTick < 1e-4 || maxTick > 1e+15) {
                notation = 'scientific';
            }
            delta = calculateDelta(tickValue, ticks);
        }
        const logDelta = log10(Math.abs(delta));
        const numDecimal = isNaN(logDelta) ? 1 : Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0);
        const options = {
            notation,
            minimumFractionDigits: numDecimal,
            maximumFractionDigits: numDecimal
        };
        Object.assign(options, this.options.ticks.format);
        return formatNumber(tickValue, locale, options);
    },
 logarithmic (tickValue, index, ticks) {
        if (tickValue === 0) {
            return '0';
        }
        const remain = ticks[index].significand || tickValue / Math.pow(10, Math.floor(log10(tickValue)));
        if ([
            1,
            2,
            3,
            5,
            10,
            15
        ].includes(remain) || index > 0.8 * ticks.length) {
            return formatters.numeric.call(this, tickValue, index, ticks);
        }
        return '';
    }
};
function calculateDelta(tickValue, ticks) {
    let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;
    if (Math.abs(delta) >= 1 && tickValue !== Math.floor(tickValue)) {
        delta = tickValue - Math.floor(tickValue);
    }
    return delta;
}
 var Ticks = {
    formatters
};

function applyScaleDefaults(defaults) {
    defaults.set('scale', {
        display: true,
        offset: false,
        reverse: false,
        beginAtZero: false,
 bounds: 'ticks',
        clip: true,
 grace: 0,
        grid: {
            display: true,
            lineWidth: 1,
            drawOnChartArea: true,
            drawTicks: true,
            tickLength: 8,
            tickWidth: (_ctx, options)=>options.lineWidth,
            tickColor: (_ctx, options)=>options.color,
            offset: false
        },
        border: {
            display: true,
            dash: [],
            dashOffset: 0.0,
            width: 1
        },
        title: {
            display: false,
            text: '',
            padding: {
                top: 4,
                bottom: 4
            }
        },
        ticks: {
            minRotation: 0,
            maxRotation: 50,
            mirror: false,
            textStrokeWidth: 0,
            textStrokeColor: '',
            padding: 3,
            display: true,
            autoSkip: true,
            autoSkipPadding: 3,
            labelOffset: 0,
            callback: Ticks.formatters.values,
            minor: {},
            major: {},
            align: 'center',
            crossAlign: 'near',
            showLabelBackdrop: false,
            backdropColor: 'rgba(255, 255, 255, 0.75)',
            backdropPadding: 2
        }
    });
    defaults.route('scale.ticks', 'color', '', 'color');
    defaults.route('scale.grid', 'color', '', 'borderColor');
    defaults.route('scale.border', 'color', '', 'borderColor');
    defaults.route('scale.title', 'color', '', 'color');
    defaults.describe('scale', {
        _fallback: false,
        _scriptable: (name)=>!name.startsWith('before') && !name.startsWith('after') && name !== 'callback' && name !== 'parser',
        _indexable: (name)=>name !== 'borderDash' && name !== 'tickBorderDash' && name !== 'dash'
    });
    defaults.describe('scales', {
        _fallback: 'scale'
    });
    defaults.describe('scale.ticks', {
        _scriptable: (name)=>name !== 'backdropPadding' && name !== 'callback',
        _indexable: (name)=>name !== 'backdropPadding'
    });
}

const overrides = Object.create(null);
const descriptors = Object.create(null);
 function getScope$1(node, key) {
    if (!key) {
        return node;
    }
    const keys = key.split('.');
    for(let i = 0, n = keys.length; i < n; ++i){
        const k = keys[i];
        node = node[k] || (node[k] = Object.create(null));
    }
    return node;
}
function set(root, scope, values) {
    if (typeof scope === 'string') {
        return merge(getScope$1(root, scope), values);
    }
    return merge(getScope$1(root, ''), scope);
}
 class Defaults {
    constructor(_descriptors, _appliers){
        this.animation = undefined;
        this.backgroundColor = 'rgba(0,0,0,0.1)';
        this.borderColor = 'rgba(0,0,0,0.1)';
        this.color = '#666';
        this.datasets = {};
        this.devicePixelRatio = (context)=>context.chart.platform.getDevicePixelRatio();
        this.elements = {};
        this.events = [
            'mousemove',
            'mouseout',
            'click',
            'touchstart',
            'touchmove'
        ];
        this.font = {
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            size: 12,
            style: 'normal',
            lineHeight: 1.2,
            weight: null
        };
        this.hover = {};
        this.hoverBackgroundColor = (ctx, options)=>getHoverColor(options.backgroundColor);
        this.hoverBorderColor = (ctx, options)=>getHoverColor(options.borderColor);
        this.hoverColor = (ctx, options)=>getHoverColor(options.color);
        this.indexAxis = 'x';
        this.interaction = {
            mode: 'nearest',
            intersect: true,
            includeInvisible: false
        };
        this.maintainAspectRatio = true;
        this.onHover = null;
        this.onClick = null;
        this.parsing = true;
        this.plugins = {};
        this.responsive = true;
        this.scale = undefined;
        this.scales = {};
        this.showLine = true;
        this.drawActiveElementsOnTop = true;
        this.describe(_descriptors);
        this.apply(_appliers);
    }
 set(scope, values) {
        return set(this, scope, values);
    }
 get(scope) {
        return getScope$1(this, scope);
    }
 describe(scope, values) {
        return set(descriptors, scope, values);
    }
    override(scope, values) {
        return set(overrides, scope, values);
    }
 route(scope, name, targetScope, targetName) {
        const scopeObject = getScope$1(this, scope);
        const targetScopeObject = getScope$1(this, targetScope);
        const privateName = '_' + name;
        Object.defineProperties(scopeObject, {
            [privateName]: {
                value: scopeObject[name],
                writable: true
            },
            [name]: {
                enumerable: true,
                get () {
                    const local = this[privateName];
                    const target = targetScopeObject[targetName];
                    if (isObject(local)) {
                        return Object.assign({}, target, local);
                    }
                    return valueOrDefault(local, target);
                },
                set (value) {
                    this[privateName] = value;
                }
            }
        });
    }
    apply(appliers) {
        appliers.forEach((apply)=>apply(this));
    }
}
var defaults = /* #__PURE__ */ new Defaults({
    _scriptable: (name)=>!name.startsWith('on'),
    _indexable: (name)=>name !== 'events',
    hover: {
        _fallback: 'interaction'
    },
    interaction: {
        _scriptable: false,
        _indexable: false
    }
}, [
    applyAnimationsDefaults,
    applyLayoutsDefaults,
    applyScaleDefaults
]);

/**
 * Converts the given font object into a CSS font string.
 * @param font - A font object.
 * @return The CSS font string. See https://developer.mozilla.org/en-US/docs/Web/CSS/font
 * @private
 */ function toFontString(font) {
    if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
        return null;
    }
    return (font.style ? font.style + ' ' : '') + (font.weight ? font.weight + ' ' : '') + font.size + 'px ' + font.family;
}
/**
 * @private
 */ function _measureText(ctx, data, gc, longest, string) {
    let textWidth = data[string];
    if (!textWidth) {
        textWidth = data[string] = ctx.measureText(string).width;
        gc.push(string);
    }
    if (textWidth > longest) {
        longest = textWidth;
    }
    return longest;
}
/**
 * @private
 */ // eslint-disable-next-line complexity
function _longestText(ctx, font, arrayOfThings, cache) {
    cache = cache || {};
    let data = cache.data = cache.data || {};
    let gc = cache.garbageCollect = cache.garbageCollect || [];
    if (cache.font !== font) {
        data = cache.data = {};
        gc = cache.garbageCollect = [];
        cache.font = font;
    }
    ctx.save();
    ctx.font = font;
    let longest = 0;
    const ilen = arrayOfThings.length;
    let i, j, jlen, thing, nestedThing;
    for(i = 0; i < ilen; i++){
        thing = arrayOfThings[i];
        // Undefined strings and arrays should not be measured
        if (thing !== undefined && thing !== null && !isArray(thing)) {
            longest = _measureText(ctx, data, gc, longest, thing);
        } else if (isArray(thing)) {
            // if it is an array lets measure each element
            // to do maybe simplify this function a bit so we can do this more recursively?
            for(j = 0, jlen = thing.length; j < jlen; j++){
                nestedThing = thing[j];
                // Undefined strings and arrays should not be measured
                if (nestedThing !== undefined && nestedThing !== null && !isArray(nestedThing)) {
                    longest = _measureText(ctx, data, gc, longest, nestedThing);
                }
            }
        }
    }
    ctx.restore();
    const gcLen = gc.length / 2;
    if (gcLen > arrayOfThings.length) {
        for(i = 0; i < gcLen; i++){
            delete data[gc[i]];
        }
        gc.splice(0, gcLen);
    }
    return longest;
}
/**
 * Returns the aligned pixel value to avoid anti-aliasing blur
 * @param chart - The chart instance.
 * @param pixel - A pixel value.
 * @param width - The width of the element.
 * @returns The aligned pixel value.
 * @private
 */ function _alignPixel(chart, pixel, width) {
    const devicePixelRatio = chart.currentDevicePixelRatio;
    const halfWidth = width !== 0 ? Math.max(width / 2, 0.5) : 0;
    return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
}
/**
 * Clears the entire canvas.
 */ function clearCanvas(canvas, ctx) {
    ctx = ctx || canvas.getContext('2d');
    ctx.save();
    // canvas.width and canvas.height do not consider the canvas transform,
    // while clearRect does
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}
function drawPoint(ctx, options, x, y) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    drawPointLegend(ctx, options, x, y, null);
}
// eslint-disable-next-line complexity
function drawPointLegend(ctx, options, x, y, w) {
    let type, xOffset, yOffset, size, cornerRadius, width, xOffsetW, yOffsetW;
    const style = options.pointStyle;
    const rotation = options.rotation;
    const radius = options.radius;
    let rad = (rotation || 0) * RAD_PER_DEG;
    if (style && typeof style === 'object') {
        type = style.toString();
        if (type === '[object HTMLImageElement]' || type === '[object HTMLCanvasElement]') {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rad);
            ctx.drawImage(style, -style.width / 2, -style.height / 2, style.width, style.height);
            ctx.restore();
            return;
        }
    }
    if (isNaN(radius) || radius <= 0) {
        return;
    }
    ctx.beginPath();
    switch(style){
        // Default includes circle
        default:
            if (w) {
                ctx.ellipse(x, y, w / 2, radius, 0, 0, TAU);
            } else {
                ctx.arc(x, y, radius, 0, TAU);
            }
            ctx.closePath();
            break;
        case 'triangle':
            width = w ? w / 2 : radius;
            ctx.moveTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
            rad += TWO_THIRDS_PI;
            ctx.lineTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
            rad += TWO_THIRDS_PI;
            ctx.lineTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
            ctx.closePath();
            break;
        case 'rectRounded':
            // NOTE: the rounded rect implementation changed to use `arc` instead of
            // `quadraticCurveTo` since it generates better results when rect is
            // almost a circle. 0.516 (instead of 0.5) produces results with visually
            // closer proportion to the previous impl and it is inscribed in the
            // circle with `radius`. For more details, see the following PRs:
            // https://github.com/chartjs/Chart.js/issues/5597
            // https://github.com/chartjs/Chart.js/issues/5858
            cornerRadius = radius * 0.516;
            size = radius - cornerRadius;
            xOffset = Math.cos(rad + QUARTER_PI) * size;
            xOffsetW = Math.cos(rad + QUARTER_PI) * (w ? w / 2 - cornerRadius : size);
            yOffset = Math.sin(rad + QUARTER_PI) * size;
            yOffsetW = Math.sin(rad + QUARTER_PI) * (w ? w / 2 - cornerRadius : size);
            ctx.arc(x - xOffsetW, y - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
            ctx.arc(x + yOffsetW, y - xOffset, cornerRadius, rad - HALF_PI, rad);
            ctx.arc(x + xOffsetW, y + yOffset, cornerRadius, rad, rad + HALF_PI);
            ctx.arc(x - yOffsetW, y + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
            ctx.closePath();
            break;
        case 'rect':
            if (!rotation) {
                size = Math.SQRT1_2 * radius;
                width = w ? w / 2 : size;
                ctx.rect(x - width, y - size, 2 * width, 2 * size);
                break;
            }
            rad += QUARTER_PI;
        /* falls through */ case 'rectRot':
            xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
            xOffset = Math.cos(rad) * radius;
            yOffset = Math.sin(rad) * radius;
            yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
            ctx.moveTo(x - xOffsetW, y - yOffset);
            ctx.lineTo(x + yOffsetW, y - xOffset);
            ctx.lineTo(x + xOffsetW, y + yOffset);
            ctx.lineTo(x - yOffsetW, y + xOffset);
            ctx.closePath();
            break;
        case 'crossRot':
            rad += QUARTER_PI;
        /* falls through */ case 'cross':
            xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
            xOffset = Math.cos(rad) * radius;
            yOffset = Math.sin(rad) * radius;
            yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
            ctx.moveTo(x - xOffsetW, y - yOffset);
            ctx.lineTo(x + xOffsetW, y + yOffset);
            ctx.moveTo(x + yOffsetW, y - xOffset);
            ctx.lineTo(x - yOffsetW, y + xOffset);
            break;
        case 'star':
            xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
            xOffset = Math.cos(rad) * radius;
            yOffset = Math.sin(rad) * radius;
            yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
            ctx.moveTo(x - xOffsetW, y - yOffset);
            ctx.lineTo(x + xOffsetW, y + yOffset);
            ctx.moveTo(x + yOffsetW, y - xOffset);
            ctx.lineTo(x - yOffsetW, y + xOffset);
            rad += QUARTER_PI;
            xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
            xOffset = Math.cos(rad) * radius;
            yOffset = Math.sin(rad) * radius;
            yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
            ctx.moveTo(x - xOffsetW, y - yOffset);
            ctx.lineTo(x + xOffsetW, y + yOffset);
            ctx.moveTo(x + yOffsetW, y - xOffset);
            ctx.lineTo(x - yOffsetW, y + xOffset);
            break;
        case 'line':
            xOffset = w ? w / 2 : Math.cos(rad) * radius;
            yOffset = Math.sin(rad) * radius;
            ctx.moveTo(x - xOffset, y - yOffset);
            ctx.lineTo(x + xOffset, y + yOffset);
            break;
        case 'dash':
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(rad) * (w ? w / 2 : radius), y + Math.sin(rad) * radius);
            break;
        case false:
            ctx.closePath();
            break;
    }
    ctx.fill();
    if (options.borderWidth > 0) {
        ctx.stroke();
    }
}
/**
 * Returns true if the point is inside the rectangle
 * @param point - The point to test
 * @param area - The rectangle
 * @param margin - allowed margin
 * @private
 */ function _isPointInArea(point, area, margin) {
    margin = margin || 0.5; // margin - default is to match rounded decimals
    return !area || point && point.x > area.left - margin && point.x < area.right + margin && point.y > area.top - margin && point.y < area.bottom + margin;
}
function clipArea(ctx, area) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
    ctx.clip();
}
function unclipArea(ctx) {
    ctx.restore();
}
/**
 * @private
 */ function _steppedLineTo(ctx, previous, target, flip, mode) {
    if (!previous) {
        return ctx.lineTo(target.x, target.y);
    }
    if (mode === 'middle') {
        const midpoint = (previous.x + target.x) / 2.0;
        ctx.lineTo(midpoint, previous.y);
        ctx.lineTo(midpoint, target.y);
    } else if (mode === 'after' !== !!flip) {
        ctx.lineTo(previous.x, target.y);
    } else {
        ctx.lineTo(target.x, previous.y);
    }
    ctx.lineTo(target.x, target.y);
}
/**
 * @private
 */ function _bezierCurveTo(ctx, previous, target, flip) {
    if (!previous) {
        return ctx.lineTo(target.x, target.y);
    }
    ctx.bezierCurveTo(flip ? previous.cp1x : previous.cp2x, flip ? previous.cp1y : previous.cp2y, flip ? target.cp2x : target.cp1x, flip ? target.cp2y : target.cp1y, target.x, target.y);
}
function setRenderOpts(ctx, opts) {
    if (opts.translation) {
        ctx.translate(opts.translation[0], opts.translation[1]);
    }
    if (!isNullOrUndef(opts.rotation)) {
        ctx.rotate(opts.rotation);
    }
    if (opts.color) {
        ctx.fillStyle = opts.color;
    }
    if (opts.textAlign) {
        ctx.textAlign = opts.textAlign;
    }
    if (opts.textBaseline) {
        ctx.textBaseline = opts.textBaseline;
    }
}
function decorateText(ctx, x, y, line, opts) {
    if (opts.strikethrough || opts.underline) {
        /**
     * Now that IE11 support has been dropped, we can use more
     * of the TextMetrics object. The actual bounding boxes
     * are unflagged in Chrome, Firefox, Edge, and Safari so they
     * can be safely used.
     * See https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics#Browser_compatibility
     */ const metrics = ctx.measureText(line);
        const left = x - metrics.actualBoundingBoxLeft;
        const right = x + metrics.actualBoundingBoxRight;
        const top = y - metrics.actualBoundingBoxAscent;
        const bottom = y + metrics.actualBoundingBoxDescent;
        const yDecoration = opts.strikethrough ? (top + bottom) / 2 : bottom;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.beginPath();
        ctx.lineWidth = opts.decorationWidth || 2;
        ctx.moveTo(left, yDecoration);
        ctx.lineTo(right, yDecoration);
        ctx.stroke();
    }
}
function drawBackdrop(ctx, opts) {
    const oldColor = ctx.fillStyle;
    ctx.fillStyle = opts.color;
    ctx.fillRect(opts.left, opts.top, opts.width, opts.height);
    ctx.fillStyle = oldColor;
}
/**
 * Render text onto the canvas
 */ function renderText(ctx, text, x, y, font, opts = {}) {
    const lines = isArray(text) ? text : [
        text
    ];
    const stroke = opts.strokeWidth > 0 && opts.strokeColor !== '';
    let i, line;
    ctx.save();
    ctx.font = font.string;
    setRenderOpts(ctx, opts);
    for(i = 0; i < lines.length; ++i){
        line = lines[i];
        if (opts.backdrop) {
            drawBackdrop(ctx, opts.backdrop);
        }
        if (stroke) {
            if (opts.strokeColor) {
                ctx.strokeStyle = opts.strokeColor;
            }
            if (!isNullOrUndef(opts.strokeWidth)) {
                ctx.lineWidth = opts.strokeWidth;
            }
            ctx.strokeText(line, x, y, opts.maxWidth);
        }
        ctx.fillText(line, x, y, opts.maxWidth);
        decorateText(ctx, x, y, line, opts);
        y += Number(font.lineHeight);
    }
    ctx.restore();
}
/**
 * Add a path of a rectangle with rounded corners to the current sub-path
 * @param ctx - Context
 * @param rect - Bounding rect
 */ function addRoundedRectPath(ctx, rect) {
    const { x , y , w , h , radius  } = rect;
    // top left arc
    ctx.arc(x + radius.topLeft, y + radius.topLeft, radius.topLeft, 1.5 * PI, PI, true);
    // line from top left to bottom left
    ctx.lineTo(x, y + h - radius.bottomLeft);
    // bottom left arc
    ctx.arc(x + radius.bottomLeft, y + h - radius.bottomLeft, radius.bottomLeft, PI, HALF_PI, true);
    // line from bottom left to bottom right
    ctx.lineTo(x + w - radius.bottomRight, y + h);
    // bottom right arc
    ctx.arc(x + w - radius.bottomRight, y + h - radius.bottomRight, radius.bottomRight, HALF_PI, 0, true);
    // line from bottom right to top right
    ctx.lineTo(x + w, y + radius.topRight);
    // top right arc
    ctx.arc(x + w - radius.topRight, y + radius.topRight, radius.topRight, 0, -HALF_PI, true);
    // line from top right to top left
    ctx.lineTo(x + radius.topLeft, y);
}

const LINE_HEIGHT = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/;
const FONT_STYLE = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
/**
 * @alias Chart.helpers.options
 * @namespace
 */ /**
 * Converts the given line height `value` in pixels for a specific font `size`.
 * @param value - The lineHeight to parse (eg. 1.6, '14px', '75%', '1.6em').
 * @param size - The font size (in pixels) used to resolve relative `value`.
 * @returns The effective line height in pixels (size * 1.2 if value is invalid).
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
 * @since 2.7.0
 */ function toLineHeight(value, size) {
    const matches = ('' + value).match(LINE_HEIGHT);
    if (!matches || matches[1] === 'normal') {
        return size * 1.2;
    }
    value = +matches[2];
    switch(matches[3]){
        case 'px':
            return value;
        case '%':
            value /= 100;
            break;
    }
    return size * value;
}
const numberOrZero = (v)=>+v || 0;
function _readValueToProps(value, props) {
    const ret = {};
    const objProps = isObject(props);
    const keys = objProps ? Object.keys(props) : props;
    const read = isObject(value) ? objProps ? (prop)=>valueOrDefault(value[prop], value[props[prop]]) : (prop)=>value[prop] : ()=>value;
    for (const prop of keys){
        ret[prop] = numberOrZero(read(prop));
    }
    return ret;
}
/**
 * Converts the given value into a TRBL object.
 * @param value - If a number, set the value to all TRBL component,
 *  else, if an object, use defined properties and sets undefined ones to 0.
 *  x / y are shorthands for same value for left/right and top/bottom.
 * @returns The padding values (top, right, bottom, left)
 * @since 3.0.0
 */ function toTRBL(value) {
    return _readValueToProps(value, {
        top: 'y',
        right: 'x',
        bottom: 'y',
        left: 'x'
    });
}
/**
 * Converts the given value into a TRBL corners object (similar with css border-radius).
 * @param value - If a number, set the value to all TRBL corner components,
 *  else, if an object, use defined properties and sets undefined ones to 0.
 * @returns The TRBL corner values (topLeft, topRight, bottomLeft, bottomRight)
 * @since 3.0.0
 */ function toTRBLCorners(value) {
    return _readValueToProps(value, [
        'topLeft',
        'topRight',
        'bottomLeft',
        'bottomRight'
    ]);
}
/**
 * Converts the given value into a padding object with pre-computed width/height.
 * @param value - If a number, set the value to all TRBL component,
 *  else, if an object, use defined properties and sets undefined ones to 0.
 *  x / y are shorthands for same value for left/right and top/bottom.
 * @returns The padding values (top, right, bottom, left, width, height)
 * @since 2.7.0
 */ function toPadding(value) {
    const obj = toTRBL(value);
    obj.width = obj.left + obj.right;
    obj.height = obj.top + obj.bottom;
    return obj;
}
/**
 * Parses font options and returns the font object.
 * @param options - A object that contains font options to be parsed.
 * @param fallback - A object that contains fallback font options.
 * @return The font object.
 * @private
 */ function toFont(options, fallback) {
    options = options || {};
    fallback = fallback || defaults.font;
    let size = valueOrDefault(options.size, fallback.size);
    if (typeof size === 'string') {
        size = parseInt(size, 10);
    }
    let style = valueOrDefault(options.style, fallback.style);
    if (style && !('' + style).match(FONT_STYLE)) {
        console.warn('Invalid font style specified: "' + style + '"');
        style = undefined;
    }
    const font = {
        family: valueOrDefault(options.family, fallback.family),
        lineHeight: toLineHeight(valueOrDefault(options.lineHeight, fallback.lineHeight), size),
        size,
        style,
        weight: valueOrDefault(options.weight, fallback.weight),
        string: ''
    };
    font.string = toFontString(font);
    return font;
}
/**
 * Evaluates the given `inputs` sequentially and returns the first defined value.
 * @param inputs - An array of values, falling back to the last value.
 * @param context - If defined and the current value is a function, the value
 * is called with `context` as first argument and the result becomes the new input.
 * @param index - If defined and the current value is an array, the value
 * at `index` become the new input.
 * @param info - object to return information about resolution in
 * @param info.cacheable - Will be set to `false` if option is not cacheable.
 * @since 2.7.0
 */ function resolve(inputs, context, index, info) {
    let cacheable = true;
    let i, ilen, value;
    for(i = 0, ilen = inputs.length; i < ilen; ++i){
        value = inputs[i];
        if (value === undefined) {
            continue;
        }
        if (context !== undefined && typeof value === 'function') {
            value = value(context);
            cacheable = false;
        }
        if (index !== undefined && isArray(value)) {
            value = value[index % value.length];
            cacheable = false;
        }
        if (value !== undefined) {
            if (info && !cacheable) {
                info.cacheable = false;
            }
            return value;
        }
    }
}
/**
 * @param minmax
 * @param grace
 * @param beginAtZero
 * @private
 */ function _addGrace(minmax, grace, beginAtZero) {
    const { min , max  } = minmax;
    const change = toDimension(grace, (max - min) / 2);
    const keepZero = (value, add)=>beginAtZero && value === 0 ? 0 : value + add;
    return {
        min: keepZero(min, -Math.abs(change)),
        max: keepZero(max, change)
    };
}
function createContext(parentContext, context) {
    return Object.assign(Object.create(parentContext), context);
}

/**
 * Creates a Proxy for resolving raw values for options.
 * @param scopes - The option scopes to look for values, in resolution order
 * @param prefixes - The prefixes for values, in resolution order.
 * @param rootScopes - The root option scopes
 * @param fallback - Parent scopes fallback
 * @param getTarget - callback for getting the target for changed values
 * @returns Proxy
 * @private
 */ function _createResolver(scopes, prefixes = [
    ''
], rootScopes, fallback, getTarget = ()=>scopes[0]) {
    const finalRootScopes = rootScopes || scopes;
    if (typeof fallback === 'undefined') {
        fallback = _resolve('_fallback', scopes);
    }
    const cache = {
        [Symbol.toStringTag]: 'Object',
        _cacheable: true,
        _scopes: scopes,
        _rootScopes: finalRootScopes,
        _fallback: fallback,
        _getTarget: getTarget,
        override: (scope)=>_createResolver([
                scope,
                ...scopes
            ], prefixes, finalRootScopes, fallback)
    };
    return new Proxy(cache, {
        /**
     * A trap for the delete operator.
     */ deleteProperty (target, prop) {
            delete target[prop]; // remove from cache
            delete target._keys; // remove cached keys
            delete scopes[0][prop]; // remove from top level scope
            return true;
        },
        /**
     * A trap for getting property values.
     */ get (target, prop) {
            return _cached(target, prop, ()=>_resolveWithPrefixes(prop, prefixes, scopes, target));
        },
        /**
     * A trap for Object.getOwnPropertyDescriptor.
     * Also used by Object.hasOwnProperty.
     */ getOwnPropertyDescriptor (target, prop) {
            return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop);
        },
        /**
     * A trap for Object.getPrototypeOf.
     */ getPrototypeOf () {
            return Reflect.getPrototypeOf(scopes[0]);
        },
        /**
     * A trap for the in operator.
     */ has (target, prop) {
            return getKeysFromAllScopes(target).includes(prop);
        },
        /**
     * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
     */ ownKeys (target) {
            return getKeysFromAllScopes(target);
        },
        /**
     * A trap for setting property values.
     */ set (target, prop, value) {
            const storage = target._storage || (target._storage = getTarget());
            target[prop] = storage[prop] = value; // set to top level scope + cache
            delete target._keys; // remove cached keys
            return true;
        }
    });
}
/**
 * Returns an Proxy for resolving option values with context.
 * @param proxy - The Proxy returned by `_createResolver`
 * @param context - Context object for scriptable/indexable options
 * @param subProxy - The proxy provided for scriptable options
 * @param descriptorDefaults - Defaults for descriptors
 * @private
 */ function _attachContext(proxy, context, subProxy, descriptorDefaults) {
    const cache = {
        _cacheable: false,
        _proxy: proxy,
        _context: context,
        _subProxy: subProxy,
        _stack: new Set(),
        _descriptors: _descriptors(proxy, descriptorDefaults),
        setContext: (ctx)=>_attachContext(proxy, ctx, subProxy, descriptorDefaults),
        override: (scope)=>_attachContext(proxy.override(scope), context, subProxy, descriptorDefaults)
    };
    return new Proxy(cache, {
        /**
     * A trap for the delete operator.
     */ deleteProperty (target, prop) {
            delete target[prop]; // remove from cache
            delete proxy[prop]; // remove from proxy
            return true;
        },
        /**
     * A trap for getting property values.
     */ get (target, prop, receiver) {
            return _cached(target, prop, ()=>_resolveWithContext(target, prop, receiver));
        },
        /**
     * A trap for Object.getOwnPropertyDescriptor.
     * Also used by Object.hasOwnProperty.
     */ getOwnPropertyDescriptor (target, prop) {
            return target._descriptors.allKeys ? Reflect.has(proxy, prop) ? {
                enumerable: true,
                configurable: true
            } : undefined : Reflect.getOwnPropertyDescriptor(proxy, prop);
        },
        /**
     * A trap for Object.getPrototypeOf.
     */ getPrototypeOf () {
            return Reflect.getPrototypeOf(proxy);
        },
        /**
     * A trap for the in operator.
     */ has (target, prop) {
            return Reflect.has(proxy, prop);
        },
        /**
     * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
     */ ownKeys () {
            return Reflect.ownKeys(proxy);
        },
        /**
     * A trap for setting property values.
     */ set (target, prop, value) {
            proxy[prop] = value; // set to proxy
            delete target[prop]; // remove from cache
            return true;
        }
    });
}
/**
 * @private
 */ function _descriptors(proxy, defaults = {
    scriptable: true,
    indexable: true
}) {
    const { _scriptable =defaults.scriptable , _indexable =defaults.indexable , _allKeys =defaults.allKeys  } = proxy;
    return {
        allKeys: _allKeys,
        scriptable: _scriptable,
        indexable: _indexable,
        isScriptable: isFunction(_scriptable) ? _scriptable : ()=>_scriptable,
        isIndexable: isFunction(_indexable) ? _indexable : ()=>_indexable
    };
}
const readKey = (prefix, name)=>prefix ? prefix + _capitalize(name) : name;
const needsSubResolver = (prop, value)=>isObject(value) && prop !== 'adapters' && (Object.getPrototypeOf(value) === null || value.constructor === Object);
function _cached(target, prop, resolve) {
    if (Object.prototype.hasOwnProperty.call(target, prop)) {
        return target[prop];
    }
    const value = resolve();
    // cache the resolved value
    target[prop] = value;
    return value;
}
function _resolveWithContext(target, prop, receiver) {
    const { _proxy , _context , _subProxy , _descriptors: descriptors  } = target;
    let value = _proxy[prop]; // resolve from proxy
    // resolve with context
    if (isFunction(value) && descriptors.isScriptable(prop)) {
        value = _resolveScriptable(prop, value, target, receiver);
    }
    if (isArray(value) && value.length) {
        value = _resolveArray(prop, value, target, descriptors.isIndexable);
    }
    if (needsSubResolver(prop, value)) {
        // if the resolved value is an object, create a sub resolver for it
        value = _attachContext(value, _context, _subProxy && _subProxy[prop], descriptors);
    }
    return value;
}
function _resolveScriptable(prop, getValue, target, receiver) {
    const { _proxy , _context , _subProxy , _stack  } = target;
    if (_stack.has(prop)) {
        throw new Error('Recursion detected: ' + Array.from(_stack).join('->') + '->' + prop);
    }
    _stack.add(prop);
    let value = getValue(_context, _subProxy || receiver);
    _stack.delete(prop);
    if (needsSubResolver(prop, value)) {
        // When scriptable option returns an object, create a resolver on that.
        value = createSubResolver(_proxy._scopes, _proxy, prop, value);
    }
    return value;
}
function _resolveArray(prop, value, target, isIndexable) {
    const { _proxy , _context , _subProxy , _descriptors: descriptors  } = target;
    if (typeof _context.index !== 'undefined' && isIndexable(prop)) {
        return value[_context.index % value.length];
    } else if (isObject(value[0])) {
        // Array of objects, return array or resolvers
        const arr = value;
        const scopes = _proxy._scopes.filter((s)=>s !== arr);
        value = [];
        for (const item of arr){
            const resolver = createSubResolver(scopes, _proxy, prop, item);
            value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop], descriptors));
        }
    }
    return value;
}
function resolveFallback(fallback, prop, value) {
    return isFunction(fallback) ? fallback(prop, value) : fallback;
}
const getScope = (key, parent)=>key === true ? parent : typeof key === 'string' ? resolveObjectKey(parent, key) : undefined;
function addScopes(set, parentScopes, key, parentFallback, value) {
    for (const parent of parentScopes){
        const scope = getScope(key, parent);
        if (scope) {
            set.add(scope);
            const fallback = resolveFallback(scope._fallback, key, value);
            if (typeof fallback !== 'undefined' && fallback !== key && fallback !== parentFallback) {
                // When we reach the descriptor that defines a new _fallback, return that.
                // The fallback will resume to that new scope.
                return fallback;
            }
        } else if (scope === false && typeof parentFallback !== 'undefined' && key !== parentFallback) {
            // Fallback to `false` results to `false`, when falling back to different key.
            // For example `interaction` from `hover` or `plugins.tooltip` and `animation` from `animations`
            return null;
        }
    }
    return false;
}
function createSubResolver(parentScopes, resolver, prop, value) {
    const rootScopes = resolver._rootScopes;
    const fallback = resolveFallback(resolver._fallback, prop, value);
    const allScopes = [
        ...parentScopes,
        ...rootScopes
    ];
    const set = new Set();
    set.add(value);
    let key = addScopesFromKey(set, allScopes, prop, fallback || prop, value);
    if (key === null) {
        return false;
    }
    if (typeof fallback !== 'undefined' && fallback !== prop) {
        key = addScopesFromKey(set, allScopes, fallback, key, value);
        if (key === null) {
            return false;
        }
    }
    return _createResolver(Array.from(set), [
        ''
    ], rootScopes, fallback, ()=>subGetTarget(resolver, prop, value));
}
function addScopesFromKey(set, allScopes, key, fallback, item) {
    while(key){
        key = addScopes(set, allScopes, key, fallback, item);
    }
    return key;
}
function subGetTarget(resolver, prop, value) {
    const parent = resolver._getTarget();
    if (!(prop in parent)) {
        parent[prop] = {};
    }
    const target = parent[prop];
    if (isArray(target) && isObject(value)) {
        // For array of objects, the object is used to store updated values
        return value;
    }
    return target || {};
}
function _resolveWithPrefixes(prop, prefixes, scopes, proxy) {
    let value;
    for (const prefix of prefixes){
        value = _resolve(readKey(prefix, prop), scopes);
        if (typeof value !== 'undefined') {
            return needsSubResolver(prop, value) ? createSubResolver(scopes, proxy, prop, value) : value;
        }
    }
}
function _resolve(key, scopes) {
    for (const scope of scopes){
        if (!scope) {
            continue;
        }
        const value = scope[key];
        if (typeof value !== 'undefined') {
            return value;
        }
    }
}
function getKeysFromAllScopes(target) {
    let keys = target._keys;
    if (!keys) {
        keys = target._keys = resolveKeysFromAllScopes(target._scopes);
    }
    return keys;
}
function resolveKeysFromAllScopes(scopes) {
    const set = new Set();
    for (const scope of scopes){
        for (const key of Object.keys(scope).filter((k)=>!k.startsWith('_'))){
            set.add(key);
        }
    }
    return Array.from(set);
}
function _parseObjectDataRadialScale(meta, data, start, count) {
    const { iScale  } = meta;
    const { key ='r'  } = this._parsing;
    const parsed = new Array(count);
    let i, ilen, index, item;
    for(i = 0, ilen = count; i < ilen; ++i){
        index = i + start;
        item = data[index];
        parsed[i] = {
            r: iScale.parse(resolveObjectKey(item, key), index)
        };
    }
    return parsed;
}

const EPSILON = Number.EPSILON || 1e-14;
const getPoint = (points, i)=>i < points.length && !points[i].skip && points[i];
const getValueAxis = (indexAxis)=>indexAxis === 'x' ? 'y' : 'x';
function splineCurve(firstPoint, middlePoint, afterPoint, t) {
    // Props to Rob Spencer at scaled innovation for his post on splining between points
    // http://scaledinnovation.com/analytics/splines/aboutSplines.html
    // This function must also respect "skipped" points
    const previous = firstPoint.skip ? middlePoint : firstPoint;
    const current = middlePoint;
    const next = afterPoint.skip ? middlePoint : afterPoint;
    const d01 = distanceBetweenPoints(current, previous);
    const d12 = distanceBetweenPoints(next, current);
    let s01 = d01 / (d01 + d12);
    let s12 = d12 / (d01 + d12);
    // If all points are the same, s01 & s02 will be inf
    s01 = isNaN(s01) ? 0 : s01;
    s12 = isNaN(s12) ? 0 : s12;
    const fa = t * s01; // scaling factor for triangle Ta
    const fb = t * s12;
    return {
        previous: {
            x: current.x - fa * (next.x - previous.x),
            y: current.y - fa * (next.y - previous.y)
        },
        next: {
            x: current.x + fb * (next.x - previous.x),
            y: current.y + fb * (next.y - previous.y)
        }
    };
}
/**
 * Adjust tangents to ensure monotonic properties
 */ function monotoneAdjust(points, deltaK, mK) {
    const pointsLen = points.length;
    let alphaK, betaK, tauK, squaredMagnitude, pointCurrent;
    let pointAfter = getPoint(points, 0);
    for(let i = 0; i < pointsLen - 1; ++i){
        pointCurrent = pointAfter;
        pointAfter = getPoint(points, i + 1);
        if (!pointCurrent || !pointAfter) {
            continue;
        }
        if (almostEquals(deltaK[i], 0, EPSILON)) {
            mK[i] = mK[i + 1] = 0;
            continue;
        }
        alphaK = mK[i] / deltaK[i];
        betaK = mK[i + 1] / deltaK[i];
        squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
        if (squaredMagnitude <= 9) {
            continue;
        }
        tauK = 3 / Math.sqrt(squaredMagnitude);
        mK[i] = alphaK * tauK * deltaK[i];
        mK[i + 1] = betaK * tauK * deltaK[i];
    }
}
function monotoneCompute(points, mK, indexAxis = 'x') {
    const valueAxis = getValueAxis(indexAxis);
    const pointsLen = points.length;
    let delta, pointBefore, pointCurrent;
    let pointAfter = getPoint(points, 0);
    for(let i = 0; i < pointsLen; ++i){
        pointBefore = pointCurrent;
        pointCurrent = pointAfter;
        pointAfter = getPoint(points, i + 1);
        if (!pointCurrent) {
            continue;
        }
        const iPixel = pointCurrent[indexAxis];
        const vPixel = pointCurrent[valueAxis];
        if (pointBefore) {
            delta = (iPixel - pointBefore[indexAxis]) / 3;
            pointCurrent[`cp1${indexAxis}`] = iPixel - delta;
            pointCurrent[`cp1${valueAxis}`] = vPixel - delta * mK[i];
        }
        if (pointAfter) {
            delta = (pointAfter[indexAxis] - iPixel) / 3;
            pointCurrent[`cp2${indexAxis}`] = iPixel + delta;
            pointCurrent[`cp2${valueAxis}`] = vPixel + delta * mK[i];
        }
    }
}
/**
 * This function calculates Bézier control points in a similar way than |splineCurve|,
 * but preserves monotonicity of the provided data and ensures no local extremums are added
 * between the dataset discrete points due to the interpolation.
 * See : https://en.wikipedia.org/wiki/Monotone_cubic_interpolation
 */ function splineCurveMonotone(points, indexAxis = 'x') {
    const valueAxis = getValueAxis(indexAxis);
    const pointsLen = points.length;
    const deltaK = Array(pointsLen).fill(0);
    const mK = Array(pointsLen);
    // Calculate slopes (deltaK) and initialize tangents (mK)
    let i, pointBefore, pointCurrent;
    let pointAfter = getPoint(points, 0);
    for(i = 0; i < pointsLen; ++i){
        pointBefore = pointCurrent;
        pointCurrent = pointAfter;
        pointAfter = getPoint(points, i + 1);
        if (!pointCurrent) {
            continue;
        }
        if (pointAfter) {
            const slopeDelta = pointAfter[indexAxis] - pointCurrent[indexAxis];
            // In the case of two points that appear at the same x pixel, slopeDeltaX is 0
            deltaK[i] = slopeDelta !== 0 ? (pointAfter[valueAxis] - pointCurrent[valueAxis]) / slopeDelta : 0;
        }
        mK[i] = !pointBefore ? deltaK[i] : !pointAfter ? deltaK[i - 1] : sign(deltaK[i - 1]) !== sign(deltaK[i]) ? 0 : (deltaK[i - 1] + deltaK[i]) / 2;
    }
    monotoneAdjust(points, deltaK, mK);
    monotoneCompute(points, mK, indexAxis);
}
function capControlPoint(pt, min, max) {
    return Math.max(Math.min(pt, max), min);
}
function capBezierPoints(points, area) {
    let i, ilen, point, inArea, inAreaPrev;
    let inAreaNext = _isPointInArea(points[0], area);
    for(i = 0, ilen = points.length; i < ilen; ++i){
        inAreaPrev = inArea;
        inArea = inAreaNext;
        inAreaNext = i < ilen - 1 && _isPointInArea(points[i + 1], area);
        if (!inArea) {
            continue;
        }
        point = points[i];
        if (inAreaPrev) {
            point.cp1x = capControlPoint(point.cp1x, area.left, area.right);
            point.cp1y = capControlPoint(point.cp1y, area.top, area.bottom);
        }
        if (inAreaNext) {
            point.cp2x = capControlPoint(point.cp2x, area.left, area.right);
            point.cp2y = capControlPoint(point.cp2y, area.top, area.bottom);
        }
    }
}
/**
 * @private
 */ function _updateBezierControlPoints(points, options, area, loop, indexAxis) {
    let i, ilen, point, controlPoints;
    // Only consider points that are drawn in case the spanGaps option is used
    if (options.spanGaps) {
        points = points.filter((pt)=>!pt.skip);
    }
    if (options.cubicInterpolationMode === 'monotone') {
        splineCurveMonotone(points, indexAxis);
    } else {
        let prev = loop ? points[points.length - 1] : points[0];
        for(i = 0, ilen = points.length; i < ilen; ++i){
            point = points[i];
            controlPoints = splineCurve(prev, point, points[Math.min(i + 1, ilen - (loop ? 0 : 1)) % ilen], options.tension);
            point.cp1x = controlPoints.previous.x;
            point.cp1y = controlPoints.previous.y;
            point.cp2x = controlPoints.next.x;
            point.cp2y = controlPoints.next.y;
            prev = point;
        }
    }
    if (options.capBezierPoints) {
        capBezierPoints(points, area);
    }
}

/**
 * Note: typedefs are auto-exported, so use a made-up `dom` namespace where
 * necessary to avoid duplicates with `export * from './helpers`; see
 * https://github.com/microsoft/TypeScript/issues/46011
 * @typedef { import('../core/core.controller.js').default } dom.Chart
 * @typedef { import('../../types').ChartEvent } ChartEvent
 */ /**
 * @private
 */ function _isDomSupported() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}
/**
 * @private
 */ function _getParentNode(domNode) {
    let parent = domNode.parentNode;
    if (parent && parent.toString() === '[object ShadowRoot]') {
        parent = parent.host;
    }
    return parent;
}
/**
 * convert max-width/max-height values that may be percentages into a number
 * @private
 */ function parseMaxStyle(styleValue, node, parentProperty) {
    let valueInPixels;
    if (typeof styleValue === 'string') {
        valueInPixels = parseInt(styleValue, 10);
        if (styleValue.indexOf('%') !== -1) {
            // percentage * size in dimension
            valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
        }
    } else {
        valueInPixels = styleValue;
    }
    return valueInPixels;
}
const getComputedStyle = (element)=>element.ownerDocument.defaultView.getComputedStyle(element, null);
function getStyle(el, property) {
    return getComputedStyle(el).getPropertyValue(property);
}
const positions = [
    'top',
    'right',
    'bottom',
    'left'
];
function getPositionedStyle(styles, style, suffix) {
    const result = {};
    suffix = suffix ? '-' + suffix : '';
    for(let i = 0; i < 4; i++){
        const pos = positions[i];
        result[pos] = parseFloat(styles[style + '-' + pos + suffix]) || 0;
    }
    result.width = result.left + result.right;
    result.height = result.top + result.bottom;
    return result;
}
const useOffsetPos = (x, y, target)=>(x > 0 || y > 0) && (!target || !target.shadowRoot);
/**
 * @param e
 * @param canvas
 * @returns Canvas position
 */ function getCanvasPosition(e, canvas) {
    const touches = e.touches;
    const source = touches && touches.length ? touches[0] : e;
    const { offsetX , offsetY  } = source;
    let box = false;
    let x, y;
    if (useOffsetPos(offsetX, offsetY, e.target)) {
        x = offsetX;
        y = offsetY;
    } else {
        const rect = canvas.getBoundingClientRect();
        x = source.clientX - rect.left;
        y = source.clientY - rect.top;
        box = true;
    }
    return {
        x,
        y,
        box
    };
}
/**
 * Gets an event's x, y coordinates, relative to the chart area
 * @param event
 * @param chart
 * @returns x and y coordinates of the event
 */ function getRelativePosition(event, chart) {
    if ('native' in event) {
        return event;
    }
    const { canvas , currentDevicePixelRatio  } = chart;
    const style = getComputedStyle(canvas);
    const borderBox = style.boxSizing === 'border-box';
    const paddings = getPositionedStyle(style, 'padding');
    const borders = getPositionedStyle(style, 'border', 'width');
    const { x , y , box  } = getCanvasPosition(event, canvas);
    const xOffset = paddings.left + (box && borders.left);
    const yOffset = paddings.top + (box && borders.top);
    let { width , height  } = chart;
    if (borderBox) {
        width -= paddings.width + borders.width;
        height -= paddings.height + borders.height;
    }
    return {
        x: Math.round((x - xOffset) / width * canvas.width / currentDevicePixelRatio),
        y: Math.round((y - yOffset) / height * canvas.height / currentDevicePixelRatio)
    };
}
function getContainerSize(canvas, width, height) {
    let maxWidth, maxHeight;
    if (width === undefined || height === undefined) {
        const container = _getParentNode(canvas);
        if (!container) {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
        } else {
            const rect = container.getBoundingClientRect(); // this is the border box of the container
            const containerStyle = getComputedStyle(container);
            const containerBorder = getPositionedStyle(containerStyle, 'border', 'width');
            const containerPadding = getPositionedStyle(containerStyle, 'padding');
            width = rect.width - containerPadding.width - containerBorder.width;
            height = rect.height - containerPadding.height - containerBorder.height;
            maxWidth = parseMaxStyle(containerStyle.maxWidth, container, 'clientWidth');
            maxHeight = parseMaxStyle(containerStyle.maxHeight, container, 'clientHeight');
        }
    }
    return {
        width,
        height,
        maxWidth: maxWidth || INFINITY,
        maxHeight: maxHeight || INFINITY
    };
}
const round1 = (v)=>Math.round(v * 10) / 10;
// eslint-disable-next-line complexity
function getMaximumSize(canvas, bbWidth, bbHeight, aspectRatio) {
    const style = getComputedStyle(canvas);
    const margins = getPositionedStyle(style, 'margin');
    const maxWidth = parseMaxStyle(style.maxWidth, canvas, 'clientWidth') || INFINITY;
    const maxHeight = parseMaxStyle(style.maxHeight, canvas, 'clientHeight') || INFINITY;
    const containerSize = getContainerSize(canvas, bbWidth, bbHeight);
    let { width , height  } = containerSize;
    if (style.boxSizing === 'content-box') {
        const borders = getPositionedStyle(style, 'border', 'width');
        const paddings = getPositionedStyle(style, 'padding');
        width -= paddings.width + borders.width;
        height -= paddings.height + borders.height;
    }
    width = Math.max(0, width - margins.width);
    height = Math.max(0, aspectRatio ? width / aspectRatio : height - margins.height);
    width = round1(Math.min(width, maxWidth, containerSize.maxWidth));
    height = round1(Math.min(height, maxHeight, containerSize.maxHeight));
    if (width && !height) {
        // https://github.com/chartjs/Chart.js/issues/4659
        // If the canvas has width, but no height, default to aspectRatio of 2 (canvas default)
        height = round1(width / 2);
    }
    const maintainHeight = bbWidth !== undefined || bbHeight !== undefined;
    if (maintainHeight && aspectRatio && containerSize.height && height > containerSize.height) {
        height = containerSize.height;
        width = round1(Math.floor(height * aspectRatio));
    }
    return {
        width,
        height
    };
}
/**
 * @param chart
 * @param forceRatio
 * @param forceStyle
 * @returns True if the canvas context size or transformation has changed.
 */ function retinaScale(chart, forceRatio, forceStyle) {
    const pixelRatio = forceRatio || 1;
    const deviceHeight = Math.floor(chart.height * pixelRatio);
    const deviceWidth = Math.floor(chart.width * pixelRatio);
    chart.height = Math.floor(chart.height);
    chart.width = Math.floor(chart.width);
    const canvas = chart.canvas;
    // If no style has been set on the canvas, the render size is used as display size,
    // making the chart visually bigger, so let's enforce it to the "correct" values.
    // See https://github.com/chartjs/Chart.js/issues/3575
    if (canvas.style && (forceStyle || !canvas.style.height && !canvas.style.width)) {
        canvas.style.height = `${chart.height}px`;
        canvas.style.width = `${chart.width}px`;
    }
    if (chart.currentDevicePixelRatio !== pixelRatio || canvas.height !== deviceHeight || canvas.width !== deviceWidth) {
        chart.currentDevicePixelRatio = pixelRatio;
        canvas.height = deviceHeight;
        canvas.width = deviceWidth;
        chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        return true;
    }
    return false;
}
/**
 * Detects support for options object argument in addEventListener.
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
 * @private
 */ const supportsEventListenerOptions = function() {
    let passiveSupported = false;
    try {
        const options = {
            get passive () {
                passiveSupported = true;
                return false;
            }
        };
        if (_isDomSupported()) {
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        }
    } catch (e) {
    // continue regardless of error
    }
    return passiveSupported;
}();
/**
 * The "used" size is the final value of a dimension property after all calculations have
 * been performed. This method uses the computed style of `element` but returns undefined
 * if the computed style is not expressed in pixels. That can happen in some cases where
 * `element` has a size relative to its parent and this last one is not yet displayed,
 * for example because of `display: none` on a parent node.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
 * @returns Size in pixels or undefined if unknown.
 */ function readUsedSize(element, property) {
    const value = getStyle(element, property);
    const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
    return matches ? +matches[1] : undefined;
}

/**
 * @private
 */ function _pointInLine(p1, p2, t, mode) {
    return {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y)
    };
}
/**
 * @private
 */ function _steppedInterpolation(p1, p2, t, mode) {
    return {
        x: p1.x + t * (p2.x - p1.x),
        y: mode === 'middle' ? t < 0.5 ? p1.y : p2.y : mode === 'after' ? t < 1 ? p1.y : p2.y : t > 0 ? p2.y : p1.y
    };
}
/**
 * @private
 */ function _bezierInterpolation(p1, p2, t, mode) {
    const cp1 = {
        x: p1.cp2x,
        y: p1.cp2y
    };
    const cp2 = {
        x: p2.cp1x,
        y: p2.cp1y
    };
    const a = _pointInLine(p1, cp1, t);
    const b = _pointInLine(cp1, cp2, t);
    const c = _pointInLine(cp2, p2, t);
    const d = _pointInLine(a, b, t);
    const e = _pointInLine(b, c, t);
    return _pointInLine(d, e, t);
}

const getRightToLeftAdapter = function(rectX, width) {
    return {
        x (x) {
            return rectX + rectX + width - x;
        },
        setWidth (w) {
            width = w;
        },
        textAlign (align) {
            if (align === 'center') {
                return align;
            }
            return align === 'right' ? 'left' : 'right';
        },
        xPlus (x, value) {
            return x - value;
        },
        leftForLtr (x, itemWidth) {
            return x - itemWidth;
        }
    };
};
const getLeftToRightAdapter = function() {
    return {
        x (x) {
            return x;
        },
        setWidth (w) {},
        textAlign (align) {
            return align;
        },
        xPlus (x, value) {
            return x + value;
        },
        leftForLtr (x, _itemWidth) {
            return x;
        }
    };
};
function getRtlAdapter(rtl, rectX, width) {
    return rtl ? getRightToLeftAdapter(rectX, width) : getLeftToRightAdapter();
}
function overrideTextDirection(ctx, direction) {
    let style, original;
    if (direction === 'ltr' || direction === 'rtl') {
        style = ctx.canvas.style;
        original = [
            style.getPropertyValue('direction'),
            style.getPropertyPriority('direction')
        ];
        style.setProperty('direction', direction, 'important');
        ctx.prevTextDirection = original;
    }
}
function restoreTextDirection(ctx, original) {
    if (original !== undefined) {
        delete ctx.prevTextDirection;
        ctx.canvas.style.setProperty('direction', original[0], original[1]);
    }
}

function propertyFn(property) {
    if (property === 'angle') {
        return {
            between: _angleBetween,
            compare: _angleDiff,
            normalize: _normalizeAngle
        };
    }
    return {
        between: _isBetween,
        compare: (a, b)=>a - b,
        normalize: (x)=>x
    };
}
function normalizeSegment({ start , end , count , loop , style  }) {
    return {
        start: start % count,
        end: end % count,
        loop: loop && (end - start + 1) % count === 0,
        style
    };
}
function getSegment(segment, points, bounds) {
    const { property , start: startBound , end: endBound  } = bounds;
    const { between , normalize  } = propertyFn(property);
    const count = points.length;
    let { start , end , loop  } = segment;
    let i, ilen;
    if (loop) {
        start += count;
        end += count;
        for(i = 0, ilen = count; i < ilen; ++i){
            if (!between(normalize(points[start % count][property]), startBound, endBound)) {
                break;
            }
            start--;
            end--;
        }
        start %= count;
        end %= count;
    }
    if (end < start) {
        end += count;
    }
    return {
        start,
        end,
        loop,
        style: segment.style
    };
}
 function _boundSegment(segment, points, bounds) {
    if (!bounds) {
        return [
            segment
        ];
    }
    const { property , start: startBound , end: endBound  } = bounds;
    const count = points.length;
    const { compare , between , normalize  } = propertyFn(property);
    const { start , end , loop , style  } = getSegment(segment, points, bounds);
    const result = [];
    let inside = false;
    let subStart = null;
    let value, point, prevValue;
    const startIsBefore = ()=>between(startBound, prevValue, value) && compare(startBound, prevValue) !== 0;
    const endIsBefore = ()=>compare(endBound, value) === 0 || between(endBound, prevValue, value);
    const shouldStart = ()=>inside || startIsBefore();
    const shouldStop = ()=>!inside || endIsBefore();
    for(let i = start, prev = start; i <= end; ++i){
        point = points[i % count];
        if (point.skip) {
            continue;
        }
        value = normalize(point[property]);
        if (value === prevValue) {
            continue;
        }
        inside = between(value, startBound, endBound);
        if (subStart === null && shouldStart()) {
            subStart = compare(value, startBound) === 0 ? i : prev;
        }
        if (subStart !== null && shouldStop()) {
            result.push(normalizeSegment({
                start: subStart,
                end: i,
                loop,
                count,
                style
            }));
            subStart = null;
        }
        prev = i;
        prevValue = value;
    }
    if (subStart !== null) {
        result.push(normalizeSegment({
            start: subStart,
            end,
            loop,
            count,
            style
        }));
    }
    return result;
}
 function _boundSegments(line, bounds) {
    const result = [];
    const segments = line.segments;
    for(let i = 0; i < segments.length; i++){
        const sub = _boundSegment(segments[i], line.points, bounds);
        if (sub.length) {
            result.push(...sub);
        }
    }
    return result;
}
 function findStartAndEnd(points, count, loop, spanGaps) {
    let start = 0;
    let end = count - 1;
    if (loop && !spanGaps) {
        while(start < count && !points[start].skip){
            start++;
        }
    }
    while(start < count && points[start].skip){
        start++;
    }
    start %= count;
    if (loop) {
        end += start;
    }
    while(end > start && points[end % count].skip){
        end--;
    }
    end %= count;
    return {
        start,
        end
    };
}
 function solidSegments(points, start, max, loop) {
    const count = points.length;
    const result = [];
    let last = start;
    let prev = points[start];
    let end;
    for(end = start + 1; end <= max; ++end){
        const cur = points[end % count];
        if (cur.skip || cur.stop) {
            if (!prev.skip) {
                loop = false;
                result.push({
                    start: start % count,
                    end: (end - 1) % count,
                    loop
                });
                start = last = cur.stop ? end : null;
            }
        } else {
            last = end;
            if (prev.skip) {
                start = end;
            }
        }
        prev = cur;
    }
    if (last !== null) {
        result.push({
            start: start % count,
            end: last % count,
            loop
        });
    }
    return result;
}
 function _computeSegments(line, segmentOptions) {
    const points = line.points;
    const spanGaps = line.options.spanGaps;
    const count = points.length;
    if (!count) {
        return [];
    }
    const loop = !!line._loop;
    const { start , end  } = findStartAndEnd(points, count, loop, spanGaps);
    if (spanGaps === true) {
        return splitByStyles(line, [
            {
                start,
                end,
                loop
            }
        ], points, segmentOptions);
    }
    const max = end < start ? end + count : end;
    const completeLoop = !!line._fullLoop && start === 0 && end === count - 1;
    return splitByStyles(line, solidSegments(points, start, max, completeLoop), points, segmentOptions);
}
 function splitByStyles(line, segments, points, segmentOptions) {
    if (!segmentOptions || !segmentOptions.setContext || !points) {
        return segments;
    }
    return doSplitByStyles(line, segments, points, segmentOptions);
}
 function doSplitByStyles(line, segments, points, segmentOptions) {
    const chartContext = line._chart.getContext();
    const baseStyle = readStyle(line.options);
    const { _datasetIndex: datasetIndex , options: { spanGaps  }  } = line;
    const count = points.length;
    const result = [];
    let prevStyle = baseStyle;
    let start = segments[0].start;
    let i = start;
    function addStyle(s, e, l, st) {
        const dir = spanGaps ? -1 : 1;
        if (s === e) {
            return;
        }
        s += count;
        while(points[s % count].skip){
            s -= dir;
        }
        while(points[e % count].skip){
            e += dir;
        }
        if (s % count !== e % count) {
            result.push({
                start: s % count,
                end: e % count,
                loop: l,
                style: st
            });
            prevStyle = st;
            start = e % count;
        }
    }
    for (const segment of segments){
        start = spanGaps ? start : segment.start;
        let prev = points[start % count];
        let style;
        for(i = start + 1; i <= segment.end; i++){
            const pt = points[i % count];
            style = readStyle(segmentOptions.setContext(createContext(chartContext, {
                type: 'segment',
                p0: prev,
                p1: pt,
                p0DataIndex: (i - 1) % count,
                p1DataIndex: i % count,
                datasetIndex
            })));
            if (styleChanged(style, prevStyle)) {
                addStyle(start, i - 1, segment.loop, prevStyle);
            }
            prev = pt;
            prevStyle = style;
        }
        if (start < i - 1) {
            addStyle(start, i - 1, segment.loop, prevStyle);
        }
    }
    return result;
}
function readStyle(options) {
    return {
        backgroundColor: options.backgroundColor,
        borderCapStyle: options.borderCapStyle,
        borderDash: options.borderDash,
        borderDashOffset: options.borderDashOffset,
        borderJoinStyle: options.borderJoinStyle,
        borderWidth: options.borderWidth,
        borderColor: options.borderColor
    };
}
function styleChanged(style, prevStyle) {
    if (!prevStyle) {
        return false;
    }
    const cache = [];
    const replacer = function(key, value) {
        if (!isPatternOrGradient(value)) {
            return value;
        }
        if (!cache.includes(value)) {
            cache.push(value);
        }
        return cache.indexOf(value);
    };
    return JSON.stringify(style, replacer) !== JSON.stringify(prevStyle, replacer);
}


//# sourceMappingURL=helpers.segment.js.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"/js/app": 0,
/******/ 			"css/app": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	__webpack_require__.O(undefined, ["css/app"], () => (__webpack_require__("./resources/js/app.js")))
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["css/app"], () => (__webpack_require__("./resources/css/app.css")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;