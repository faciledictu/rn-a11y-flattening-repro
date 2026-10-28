package com.reproducerapp

import android.accessibilityservice.AccessibilityServiceInfo
import android.app.Activity
import android.app.Instrumentation
import android.app.UiAutomation
import android.content.Intent
import android.os.Bundle
import android.view.accessibility.AccessibilityNodeInfo

// Prints the accessibility nodes of the reproducer as a screen reader sees them. With Metro
// running and the app installed:
//   adb shell "am instrument -w -e parents 1 -e targets 'Shipping W1,Shipping W2' \
//     com.reproducerapp.test/com.reproducerapp.A11yProbe"
// -e targets: comma-separated prefixes of a node's text or content description.
// -e parents N: also print the N nodes above each match (the Views around a Text).
// -e wait MS: how long to wait for the app to render (default 8000).
class A11yProbe : Instrumentation() {
  private lateinit var args: Bundle

  override fun onCreate(arguments: Bundle?) {
    super.onCreate(arguments)
    args = arguments ?: Bundle()
    start()
  }

  private fun report(text: String) {
    sendStatus(0, Bundle().apply { putString(REPORT_KEY_STREAMRESULT, text + "\n") })
  }

  override fun onStart() {
    super.onStart()
    val automation = getUiAutomation(UiAutomation.FLAG_DONT_SUPPRESS_ACCESSIBILITY_SERVICES)
    automation.serviceInfo =
        automation.serviceInfo.apply {
          flags =
              flags or
                  AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS or
                  AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
        }
    // `am instrument` restarts the app process without an activity: open it and let React Native
    // load the bundle from Metro and render.
    startActivitySync(
        Intent(targetContext, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    Thread.sleep((args.getString("wait") ?: "8000").toLong())

    val targets = (args.getString("targets") ?: "").split(",").filter { it.isNotBlank() }
    for (target in targets) {
      val node = findText(appRoot(automation), target)
      if (node == null) {
        report("== $target: not found")
        continue
      }
      report("== $target\n" + describe(node))
      var up: AccessibilityNodeInfo? = node
      repeat(args.getString("parents")?.toInt() ?: 0) { level ->
        up = up?.parent
        report("parent ${level + 1}:\n" + (up?.let { describe(it) } ?: "  none"))
      }
    }
    finish(Activity.RESULT_OK, Bundle())
  }

  // The root of the reproducer's window; the active window may belong to TalkBack.
  private fun appRoot(automation: UiAutomation): AccessibilityNodeInfo? {
    repeat(10) {
      automation.windows
          .mapNotNull { it.root }
          .firstOrNull { it.packageName == "com.reproducerapp" }
          ?.let { return it }
      Thread.sleep(300)
    }
    report("windows: " + automation.windows.joinToString { "${it.title}/${it.root?.packageName}" })
    return null
  }

  // The first node, depth first, whose content description or text starts with the prefix.
  private fun findText(root: AccessibilityNodeInfo?, prefix: String): AccessibilityNodeInfo? {
    if (root == null) return null
    val label = root.contentDescription?.toString() ?: root.text?.toString() ?: ""
    if (label.startsWith(prefix)) return root
    for (i in 0 until root.childCount) {
      findText(root.getChild(i), prefix)?.let { return it }
    }
    return null
  }

  private fun describe(n: AccessibilityNodeInfo): String {
    val range = n.rangeInfo?.let { "min=${it.min} max=${it.max} current=${it.current}" }
    val actions = n.actionList.joinToString { a -> actionName(a.id) + (a.label?.let { "(\"$it\")" } ?: "") }
    return listOf(
            "  class=${n.className} text=${n.text} desc=${n.contentDescription}",
            "  heading=${n.isHeading} clickable=${n.isClickable} checkable=${n.isCheckable} " +
                "checked=${n.isChecked} focusable=${n.isFocusable} hint=${n.hintText}",
            "  stateDescription=${n.stateDescription} rangeInfo=${range ?: "none"}",
            "  actions=[$actions]",
        )
        .joinToString("\n")
  }

  // Standard actions by name; a custom action (React Native's accessibilityActions) shows its id
  // and label.
  private fun actionName(id: Int): String =
      when (id) {
        AccessibilityNodeInfo.ACTION_CLICK -> "CLICK"
        AccessibilityNodeInfo.ACTION_LONG_CLICK -> "LONG_CLICK"
        AccessibilityNodeInfo.ACTION_FOCUS -> "FOCUS"
        AccessibilityNodeInfo.ACTION_SELECT -> "SELECT"
        AccessibilityNodeInfo.ACTION_CLEAR_SELECTION -> "CLEAR_SELECTION"
        AccessibilityNodeInfo.ACTION_ACCESSIBILITY_FOCUS -> "A11Y_FOCUS"
        AccessibilityNodeInfo.ACTION_CLEAR_ACCESSIBILITY_FOCUS -> "CLEAR_A11Y_FOCUS"
        AccessibilityNodeInfo.ACTION_NEXT_AT_MOVEMENT_GRANULARITY -> "NEXT_AT_GRANULARITY"
        AccessibilityNodeInfo.ACTION_PREVIOUS_AT_MOVEMENT_GRANULARITY -> "PREVIOUS_AT_GRANULARITY"
        AccessibilityNodeInfo.ACTION_SET_SELECTION -> "SET_SELECTION"
        AccessibilityNodeInfo.ACTION_SCROLL_FORWARD -> "SCROLL_FORWARD"
        AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD -> "SCROLL_BACKWARD"
        android.R.id.accessibilityActionShowOnScreen -> "SHOW_ON_SCREEN"
        android.R.id.accessibilityActionScrollDown -> "SCROLL_DOWN"
        else -> "0x" + Integer.toHexString(id)
      }
}
