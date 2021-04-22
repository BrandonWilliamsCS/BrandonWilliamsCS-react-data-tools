# React Resource


## Motivation

The React library naturally promotes a "data down, events up" pattern that follows the hierarchy of components. A parent component owns state and renders its children based on that state, thereby passing data down. A function can accompany that data, thereby allowing imperative changes (conceptually, events and their consequences) to travel back up the hierarchy and change state at the parent. This architecture does a great job at taming the declarative-plus-imperative nature of web (and more generally, GUI) applications without taking away the power.

However, sometimes your app data model does not fit cleanly into the hierarchical flow of your view code. For example, what if two "sibling" components need to share state in some way? The generally-recommended solution is to ["hoist" (or lift) state](https://reactjs.org/docs/lifting-state-up.html) so that it sits in the common parent, who can then provide the single state to both children. Truly, this is often sufficient but can also lead to some undesirable consequences.

Firstly, the parent must now "know" about the state needs of the children - when otherwise that could be an implementation detail. And what if that state needs to span to not just a "sibling", but a "distant cousin"? If you hoist state to the common ancestor, now several intermediate components need to be aware of this shared state - and possibly *only* so that it can pass it along to the consumer. This problem, in turn, is largely solved by [context](https://reactjs.org/docs/context.html). Context, however, is unfortunately not free of its own complications. The common ancestor still needs to "know" about the requirement of (possibly) distant descendants, and particularly that needs to meet that need through context instead of props. Overall, context is a very flexible and powerful feature that is easy to misuse.

Other issues arise in the environment of a large-scale app, with "ambient" concerns such as localization, auth-aware API access, configuration and preferences, etc. It's tempting to stink the code up with multiple contexts and one-off hooks to access this data. On top of this, a complex logical model still needs to ensure that all changes ultimately result in calls to a React state setter.

This library intends to promote good, clean patterns for navigating these difficulties by provide tools and techniques that encourage, enable, and enforce them.

## Tools

1. Promise Status - JavaScript promises do not offer direct access to status and results (and don't trigger a re-render upon resolution anyway). Thus, use of promised data in a component requires state management - both for loading state and for the actual value. The `usePromiseStatus` hook encapsulates that state management by translating a promise into a `PromiseStatus` that provides direct, synchronous access to the status of the promise and re-rendering when that changes. The `PromiseGate` component further extends the logic to "switch over" the possible statuses when rendering.

2. Ambient/App resources - In a large-scale SPA or similar web app, there are often universal, app-wide, or "ambient" pieces of data or logic. For example, the logged-in user's auth token, which may in turn be consumed by a configurable instance of an API service. Instead of storing these in a global/window variable, there are several benefits to using React context. The `ResourceProvider` component and the `useResources` hook provide a clean, context-backed API for this purpose, including usage guidelines that encourage good practices.

3. Stable Computed Values - React recommends using the `useRef` when a value needs to be maintained across renders - however, any logic to adjust or re-compute that value based on other dependency values needs to be implemented manually. Additionally, the `useMemo` hook is explicitly for performance - there is no guarantee that a value will be re-used simply because the dependencies are unchanged. Between the two, there is no simple solution for a stable yet computed value - one that changes (i.e., is recomputed) if and only if the dependency values change. The `useStableValue` hook fills this vacant spot by mimicking the `useMemo` behavior but guarantees stability via `useRef`. Beware that this hook can lead to code smells: a stable value requires stable dependencies, which may cascade by requiring further usage of `useStableValue`. When possible, perform these computations with explicit, imperative state changes rather than implicit dependency change detection.

4. Promised State - Sometimes the underlying model (that is, anything passed down via props or context) contains promises, but other times the model serves to contain the logic that *creates* promises. In those cases, managing the "current version" of the promised data can be handled by a hook specialized to storing computed promises as state. The `useDelayedState` hook behaves much like `useState` but with the premise that the tracked state will be "delayed" - that is, computed such that it will result in a promise and not a plain value. This allows the consumer to "set" the parameters of this computation to trigger a (re-)computation, but render based on the resulting. promise.