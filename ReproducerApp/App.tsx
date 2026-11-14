import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

// Accessibility props that do not keep a View in the native tree (Fabric view
// flattening). Each section pairs the View under test, which has no style,
// testID or nativeID (any of them keeps the View), with the same View and
// collapsable={false} as the control.
//
// Inspect with Accessibility Inspector (iOS) or
// `adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml`
// (Android). Escape needs VoiceOver; the README says what to look at.

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontWeight: '600' }}>{title}</Text>
      {children}
    </View>
  );
}

// Only on elements that are kept anyway (Pressable, accessible View).
const box = { padding: 8, borderWidth: 1, borderColor: '#888' } as const;
const swatch = { width: 44, height: 44, backgroundColor: '#e33' } as const;
const archive = [{ name: 'archive', label: 'Archive' }];
// Section 14: a background keeps the View (formsView) but mounts its children
// next to it, not inside.
const tint = { backgroundColor: '#eef' } as const;

export default function App() {
  const [last, setLast] = useState('none');

  return (
    <ScrollView contentContainerStyle={{ padding: 48, gap: 24 }}>
      <Text>Last event: {last}</Text>

      <Section title="1. accessibilityLabel (Android)">
        <View accessibilityLabel="Cart L1">
          <Text>3 items L1</Text>
        </View>
        <View accessibilityLabel="Cart L2" collapsable={false}>
          <Text>3 items L2 (control)</Text>
        </View>
      </Section>

      <Section title="2. accessibilityLabel inside an accessible parent">
        <Pressable onPress={() => setLast('P1 onPress')} style={box}>
          <View accessibilityLabel="Close dialog P1">
            <Text>× P1</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => setLast('P2 onPress')} style={box}>
          <View accessibilityLabel="Close dialog P2" collapsable={false}>
            <Text>× P2 (control)</Text>
          </View>
        </Pressable>
      </Section>

      <Section title="3. accessibilityRole tabbar (iOS)">
        <View accessibilityRole="tabbar" style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable accessibilityRole="tab" style={box}>
            <Text>Tab K1</Text>
          </Pressable>
          <Pressable accessibilityRole="tab" style={box}>
            <Text>Tab K2</Text>
          </Pressable>
        </View>
        <View
          accessibilityRole="tabbar"
          collapsable={false}
          style={{ flexDirection: 'row', gap: 8 }}
        >
          <Pressable accessibilityRole="tab" style={box}>
            <Text>Tab K3 (control)</Text>
          </Pressable>
          <Pressable accessibilityRole="tab" style={box}>
            <Text>Tab K4 (control)</Text>
          </Pressable>
        </View>
      </Section>

      <Section title="4. onAccessibilityEscape (iOS, VoiceOver)">
        <View onAccessibilityEscape={() => setLast('E1 escape')}>
          <Text>Dialog text E1</Text>
        </View>
        <View
          onAccessibilityEscape={() => setLast('E2 escape')}
          collapsable={false}
        >
          <Text>Dialog text E2 (control)</Text>
        </View>
      </Section>

      <Section title="5. Large Content Viewer (iOS, largest text size)">
        <View
          accessibilityShowsLargeContentViewer
          accessibilityLargeContentTitle="Home H1"
        >
          <Text>Home H1</Text>
        </View>
        <View
          accessibilityShowsLargeContentViewer
          accessibilityLargeContentTitle="Home H2"
          collapsable={false}
        >
          <Text>Home H2 (control)</Text>
        </View>
      </Section>

      <Section title="6. accessibilityActions on a parent">
        <View
          accessibilityActions={archive}
          onAccessibilityAction={() => setLast('Q1 parent archive')}
        >
          <View accessible style={box}>
            <Text>Child Q1</Text>
          </View>
        </View>
        <View
          accessibilityActions={archive}
          onAccessibilityAction={() => setLast('Q2 parent archive')}
          collapsable={false}
        >
          <View accessible style={box}>
            <Text>Child Q2 (control)</Text>
          </View>
        </View>
      </Section>

      <Section title="7. role heading (Android)">
        <View role="heading">
          <Text>Shipping W1</Text>
        </View>
        <View role="heading" collapsable={false}>
          <Text>Shipping W2 (control)</Text>
        </View>
      </Section>

      <Section title="8. aria-checked (Android)">
        <View aria-checked>
          <Text>Terms W3</Text>
        </View>
        <View aria-checked collapsable={false}>
          <Text>Terms W4 (control)</Text>
        </View>
      </Section>

      <Section title="9. accessibilityValue text and aria-busy (Android)">
        <View accessibilityValue={{ text: '3 of 5' }}>
          <Text>Rating V1</Text>
        </View>
        <View accessibilityValue={{ text: '3 of 5' }} collapsable={false}>
          <Text>Rating V2 (control)</Text>
        </View>
        <View aria-busy>
          <Text>Orders B1</Text>
        </View>
        <View aria-busy collapsable={false}>
          <Text>Orders B2 (control)</Text>
        </View>
      </Section>

      <Section title="10. accessibilityIgnoresInvertColors (iOS, Smart Invert)">
        <View style={{ flexDirection: 'row', gap: 24 }}>
          <View accessibilityIgnoresInvertColors>
            <View style={swatch} />
          </View>
          <View accessibilityIgnoresInvertColors collapsable={false}>
            <View style={swatch} />
          </View>
          <View style={swatch} />
        </View>
        <Text>Left: I1, middle: I2 (control), right: no prop</Text>
      </Section>

      <Section title="11. accessibilityHint (expected: no effect)">
        <View accessibilityHint="Hint N1">
          <Text>Note N1</Text>
        </View>
        <View accessibilityHint="Hint N2" collapsable={false}>
          <Text>Note N2 (control)</Text>
        </View>
      </Section>

      <Section title="12. accessibilityLanguage (iOS, VoiceOver)">
        <Text accessibilityLanguage="de-DE">Zeitung G0 (on the Text)</Text>
        <View accessibilityLanguage="de-DE">
          <Text>Zeitung G1</Text>
        </View>
        <View accessibilityLanguage="de-DE" collapsable={false}>
          <Text>Zeitung G2 (control)</Text>
        </View>
      </Section>

      <Section title="13. aria-disabled, aria-selected, aria-expanded, aria-checked false (Android)">
        <View aria-disabled>
          <Text>Payment D1</Text>
        </View>
        <View aria-disabled collapsable={false}>
          <Text>Payment D2 (control)</Text>
        </View>
        <View aria-selected>
          <Text>Plan S1</Text>
        </View>
        <View aria-selected collapsable={false}>
          <Text>Plan S2 (control)</Text>
        </View>
        <View aria-expanded>
          <Text>Details X1</Text>
        </View>
        <View aria-expanded collapsable={false}>
          <Text>Details X2 (control)</Text>
        </View>
        <View aria-checked={false}>
          <Text>Terms W5</Text>
        </View>
        <View aria-checked={false} collapsable={false}>
          <Text>Terms W6 (control)</Text>
        </View>
      </Section>

      <Section title="14. Kept without its children (backgroundColor only)">
        <View accessibilityLabel="Cart L3" style={tint}>
          <Text>3 items L3</Text>
        </View>
        <View accessibilityLabel="Cart L4" collapsable={false} style={tint}>
          <Text>3 items L4 (control)</Text>
        </View>
        <Pressable onPress={() => setLast('P3 onPress')} style={box}>
          <View accessibilityLabel="Close dialog P3" style={tint}>
            <Text>× P3</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => setLast('P4 onPress')} style={box}>
          <View
            accessibilityLabel="Close dialog P4"
            collapsable={false}
            style={tint}
          >
            <Text>× P4 (control)</Text>
          </View>
        </Pressable>
        <View
          accessibilityRole="tabbar"
          style={[tint, { flexDirection: 'row', gap: 8 }]}
        >
          <Pressable accessibilityRole="tab" style={box}>
            <Text>Tab K5</Text>
          </Pressable>
          <Pressable accessibilityRole="tab" style={box}>
            <Text>Tab K6</Text>
          </Pressable>
        </View>
        <View
          accessibilityRole="tabbar"
          collapsable={false}
          style={[tint, { flexDirection: 'row', gap: 8 }]}
        >
          <Pressable accessibilityRole="tab" style={box}>
            <Text>Tab K7 (control)</Text>
          </Pressable>
          <Pressable accessibilityRole="tab" style={box}>
            <Text>Tab K8 (control)</Text>
          </Pressable>
        </View>
        <View onAccessibilityEscape={() => setLast('E3 escape')} style={tint}>
          <Text>Dialog text E3</Text>
        </View>
        <View
          onAccessibilityEscape={() => setLast('E4 escape')}
          collapsable={false}
          style={tint}
        >
          <Text>Dialog text E4 (control)</Text>
        </View>
        <View
          accessibilityShowsLargeContentViewer
          accessibilityLargeContentTitle="Home H3"
          style={tint}
        >
          <Text>Home H3</Text>
        </View>
        <View
          accessibilityShowsLargeContentViewer
          accessibilityLargeContentTitle="Home H4"
          collapsable={false}
          style={tint}
        >
          <Text>Home H4 (control)</Text>
        </View>
        <View
          accessibilityActions={archive}
          onAccessibilityAction={() => setLast('Q3 parent archive')}
          style={tint}
        >
          <View accessible style={box}>
            <Text>Child Q3</Text>
          </View>
        </View>
        <View
          accessibilityActions={archive}
          onAccessibilityAction={() => setLast('Q4 parent archive')}
          collapsable={false}
          style={tint}
        >
          <View accessible style={box}>
            <Text>Child Q4 (control)</Text>
          </View>
        </View>
        <View role="heading" style={tint}>
          <Text>Shipping W7</Text>
        </View>
        <View role="heading" collapsable={false} style={tint}>
          <Text>Shipping W8 (control)</Text>
        </View>
      </Section>
    </ScrollView>
  );
}
