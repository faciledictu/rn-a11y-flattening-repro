# rn-a11y-flattening-repro

![Build](https://github.com/faciledictu/rn-a11y-flattening-repro/workflows/Pre%20Merge%20Checks/badge.svg)

Accessibility props that are lost when Fabric flattens a `View` (React Native
0.88.0, new architecture). `ViewShadowNode::initialize` keeps a host view for
`accessible`, `accessibilityElementsHidden`, `accessibilityViewIsModal`,
`accessibilityLiveRegion`, `importantForAccessibility` and a few others, but
not for the props below, although iOS or Android reads them from a view that is
not itself an accessibility element.

One screen, [`ReproducerApp/App.tsx`](ReproducerApp/App.tsx). Each section
pairs the View under test, which has no style, `testID` or `nativeID` (any of
them keeps the View), with the same View and `collapsable={false}` as the
control. Borders are only on elements that are kept anyway.

## Run

```bash
cd ReproducerApp
yarn install
yarn start
yarn android
cd ios && bundle install && bundle exec pod install && cd .. && yarn ios
```

iOS: Accessibility Inspector (Label, Traits, Actions, Hierarchy) and
VoiceOver on a device for sections 3, 4 and 12. Android:
`adb shell uiautomator dump`, A11yProbe (below) and TalkBack.

## Results

iOS 27.0 simulator and an iPhone 11 Pro with iOS 27.0.1; Samsung SM-A276B with
Android 16 and TalkBack 16.2.

| # | Prop | Platform | Flattened | Control (`collapsable={false}`) |
| - | ---- | -------- | --------- | ------------------------------- |
| 1 | `accessibilityLabel` | Android | No node carries "Cart L1"; TalkBack reads "Three items L1" | Node with `content-desc="Cart L2"`; TalkBack reads "Cart L2" |
| 2 | `accessibilityLabel` inside a `Pressable` | iOS, Android | The button's label is "× P1"; TalkBack reads "Multiplied by P1" | The button's label is "Close dialog P2" on both |
| 3 | `accessibilityRole="tabbar"` | iOS | No container above the tabs (Inspector, Hierarchy); VoiceOver reads "Tab K1" | VoiceOver reads "Tab K3 (control), tab, 1 of 2" |
| 4 | `onAccessibilityEscape` | iOS | Escape on E1 runs E2's handler: with no handler in the focused element's chain, VoiceOver runs the first handler on screen | Escape on E2 runs E2's handler |
| 5 | `accessibilityShowsLargeContentViewer`, `accessibilityLargeContentTitle` | iOS | Long press at the largest text size shows nothing | Long press shows the viewer with "Home H2" |
| 6 | `accessibilityActions` on a parent | iOS | The child Q1 has no Archive action | The child Q2 lists Archive, and it runs the parent's handler |
| 7 | `role="heading"` | Android | No heading node | A node with `heading=true` |
| 8 | `aria-checked` | Android | No checkable node | A node with `checkable=true checked=true` |
| 9 | `accessibilityValue.text`, `aria-busy` | Android | No node | A node with `content-desc="3 of 5"` / `"busy"` (that the name is replaced is a separate bug, in `updateViewContentDescription`) |
| 10 | `accessibilityIgnoresInvertColors` | iOS | Smart Invert inverts the square | The square stays red |
| 11 | `accessibilityHint` | iOS, Android | No hint | No hint either: no effect |
| 12 | `accessibilityLanguage` | iOS | English voice | English voice too: no effect. On the `Text` itself (G0) it works |

On iOS, sections 7, 8, 9, 11 and 12 make no difference: a container that is
not an element is not read. On Android, section 6 makes no difference to
TalkBack: the kept container has the action but is not focusable, and Android
does not pass actions to children.

## A11yProbe (Android)

[`A11yProbe`](ReproducerApp/android/app/src/androidTest/java/com/reproducerapp/A11yProbe.kt)
prints the accessibility nodes as a screen reader sees them, with no extra
dependencies. With Metro running:

```bash
cd ReproducerApp/android && ./gradlew app:installDebug app:installDebugAndroidTest
adb reverse tcp:8081 tcp:8081
adb shell "am instrument -w -e parents 1 -e targets 'Shipping W1,Shipping W2' com.reproducerapp.test/com.reproducerapp.A11yProbe"
```
