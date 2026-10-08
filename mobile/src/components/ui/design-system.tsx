import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

// ============================================================
// Shared
// ============================================================

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text variant="h3">{title}</Text>

        {description ? <Text variant="muted">{description}</Text> : null}
      </View>

      {children}
    </View>
  );
}

function Divider() {
  return <View className="bg-border h-px" />;
}

// ============================================================
// 01. DESIGN TOKENS
// ============================================================

function DesignTokens() {
  return (
    <View className="gap-8">
      {/* Colors */}
      <Section
        title="Colors"
        description="Semantic colors from CSS variables."
      >
        <View className="flex-row flex-wrap gap-3">
          <View className="gap-2 w-[47%]">
            <View className="bg-background border border-border rounded-lg h-20" />
            <Text variant="small">background</Text>
          </View>

          <View className="gap-2 w-[47%]">
            <View className="bg-foreground border border-border rounded-lg h-20" />
            <Text variant="small">foreground</Text>
          </View>

          <View className="gap-2 w-[47%]">
            <View className="bg-card border border-border rounded-lg h-20" />
            <Text variant="small">card</Text>
          </View>

          <View className="gap-2 w-[47%]">
            <View className="bg-popover border border-border rounded-lg h-20" />
            <Text variant="small">popover</Text>
          </View>

          <View className="gap-2 w-[47%]">
            <View className="bg-primary rounded-lg h-20" />
            <Text variant="small">primary</Text>
          </View>

          <View className="gap-2 w-[47%]">
            <View className="bg-secondary rounded-lg h-20" />
            <Text variant="small">secondary</Text>
          </View>

          <View className="gap-2 w-[47%]">
            <View className="bg-muted rounded-lg h-20" />
            <Text variant="small">muted</Text>
          </View>

          <View className="gap-2 w-[47%]">
            <View className="bg-accent rounded-lg h-20" />
            <Text variant="small">accent</Text>
          </View>

          <View className="gap-2 w-[47%]">
            <View className="bg-destructive rounded-lg h-20" />
            <Text variant="small">destructive</Text>
          </View>

          <View className="gap-2 w-[47%]">
            <View className="bg-border rounded-lg h-20" />
            <Text variant="small">border</Text>
          </View>

          <View className="gap-2 w-[47%]">
            <View className="bg-input rounded-lg h-20" />
            <Text variant="small">input</Text>
          </View>

          <View className="gap-2 w-[47%]">
            <View className="rounded-lg bg-ring h-20" />
            <Text variant="small">ring</Text>
          </View>
        </View>
      </Section>

      <Divider />

      {/* Foreground colors */}
      <Section
        title="Foreground"
        description="Text colors paired with semantic backgrounds."
      >
        <View className="gap-3">
          <View className="bg-background p-4 rounded-lg">
            <Text className="text-foreground">foreground</Text>
          </View>

          <View className="bg-card p-4 rounded-lg">
            <Text className="text-card-foreground">card-foreground</Text>
          </View>

          <View className="bg-popover p-4 rounded-lg">
            <Text className="text-popover-foreground">popover-foreground</Text>
          </View>

          <View className="bg-primary p-4 rounded-lg">
            <Text className="text-primary-foreground">primary-foreground</Text>
          </View>

          <View className="bg-secondary p-4 rounded-lg">
            <Text className="text-secondary-foreground">
              secondary-foreground
            </Text>
          </View>

          <View className="bg-muted p-4 rounded-lg">
            <Text className="text-muted-foreground">muted-foreground</Text>
          </View>

          <View className="bg-accent p-4 rounded-lg">
            <Text className="text-accent-foreground">accent-foreground</Text>
          </View>

          <View className="bg-destructive p-4 rounded-lg">
            <Text className="text-destructive-foreground">
              destructive-foreground
            </Text>
          </View>
        </View>
      </Section>

      <Divider />

      {/* Charts */}
      <Section
        title="Charts"
        description="Chart palette defined in CSS."
      >
        <View className="gap-3">
          <View className="gap-1">
            <Text variant="small">chart-1</Text>
            <View className="bg-chart-1 rounded-full w-full h-4" />
          </View>

          <View className="gap-1">
            <Text variant="small">chart-2</Text>
            <View className="bg-chart-2 rounded-full w-4/5 h-4" />
          </View>

          <View className="gap-1">
            <Text variant="small">chart-3</Text>
            <View className="bg-chart-3 rounded-full w-3/5 h-4" />
          </View>

          <View className="gap-1">
            <Text variant="small">chart-4</Text>
            <View className="bg-chart-4 rounded-full w-2/5 h-4" />
          </View>

          <View className="gap-1">
            <Text variant="small">chart-5</Text>
            <View className="bg-chart-5 rounded-full w-1/5 h-4" />
          </View>
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1 bg-chart-1 rounded-lg h-10" />
          <View className="flex-1 bg-chart-2 rounded-lg h-10" />
          <View className="flex-1 bg-chart-3 rounded-lg h-10" />
          <View className="flex-1 bg-chart-4 rounded-lg h-10" />
          <View className="flex-1 bg-chart-5 rounded-lg h-10" />
        </View>
      </Section>

      <Divider />

      {/* Spacing */}
      <Section
        title="Spacing"
        description="Default Tailwind spacing scale."
      >
        <View className="gap-3">
          <View className="flex-row items-center gap-4">
            <Text className="w-8">1</Text>
            <View className="bg-primary w-1 h-4" />
            <Text variant="muted">4px</Text>
          </View>

          <View className="flex-row items-center gap-4">
            <Text className="w-8">2</Text>
            <View className="bg-primary w-2 h-4" />
            <Text variant="muted">8px</Text>
          </View>

          <View className="flex-row items-center gap-4">
            <Text className="w-8">3</Text>
            <View className="bg-primary w-3 h-4" />
            <Text variant="muted">12px</Text>
          </View>

          <View className="flex-row items-center gap-4">
            <Text className="w-8">4</Text>
            <View className="bg-primary w-4 h-4" />
            <Text variant="muted">16px</Text>
          </View>

          <View className="flex-row items-center gap-4">
            <Text className="w-8">6</Text>
            <View className="bg-primary w-6 h-4" />
            <Text variant="muted">24px</Text>
          </View>

          <View className="flex-row items-center gap-4">
            <Text className="w-8">8</Text>
            <View className="bg-primary w-8 h-4" />
            <Text variant="muted">32px</Text>
          </View>

          <View className="flex-row items-center gap-4">
            <Text className="w-8">10</Text>
            <View className="bg-primary w-10 h-4" />
            <Text variant="muted">40px</Text>
          </View>

          <View className="flex-row items-center gap-4">
            <Text className="w-8">12</Text>
            <View className="bg-primary w-12 h-4" />
            <Text variant="muted">48px</Text>
          </View>

          <View className="flex-row items-center gap-4">
            <Text className="w-8">16</Text>
            <View className="bg-primary w-16 h-4" />
            <Text variant="muted">64px</Text>
          </View>
        </View>
      </Section>

      <Divider />

      {/* Radius */}
      <Section
        title="Border radius"
        description="Visual preview of Tailwind radius utilities."
      >
        <View className="flex-row flex-wrap gap-4">
          <View className="items-center gap-2">
            <View className="bg-primary rounded-none size-16" />
            <Text variant="small">none</Text>
          </View>

          <View className="items-center gap-2">
            <View className="bg-primary rounded-sm size-16" />
            <Text variant="small">sm</Text>
          </View>

          <View className="items-center gap-2">
            <View className="bg-primary rounded-md size-16" />
            <Text variant="small">md</Text>
          </View>

          <View className="items-center gap-2">
            <View className="bg-primary rounded-lg size-16" />
            <Text variant="small">lg</Text>
          </View>

          <View className="items-center gap-2">
            <View className="bg-primary rounded-xl size-16" />
            <Text variant="small">xl</Text>
          </View>

          <View className="items-center gap-2">
            <View className="bg-primary rounded-2xl size-16" />
            <Text variant="small">2xl</Text>
          </View>

          <View className="items-center gap-2">
            <View className="bg-primary rounded-full size-16" />
            <Text variant="small">full</Text>
          </View>
        </View>
      </Section>

      <Divider />

      {/* Borders */}
      <Section
        title="Borders & Ring"
        description="Border colors and focus indicators."
      >
        <View className="gap-3">
          <View className="bg-background p-4 border border-border rounded-lg">
            <Text>border-border</Text>
          </View>

          <View className="bg-background p-4 border border-input rounded-lg">
            <Text>border-input</Text>
          </View>

          <View className="bg-background p-4 border-2 border-ring rounded-lg">
            <Text>border-ring</Text>
          </View>

          <View className="bg-background p-4 border-4 border-primary rounded-lg">
            <Text>border-primary</Text>
          </View>
        </View>
      </Section>

      <Divider />

      {/* Fonts */}
      <Section
        title="Font families"
        description="Font utilities configured in NativeWind."
      >
        <View className="gap-4">
          <View className="gap-1">
            <Text variant="muted">Sans</Text>
            <Text className="font-sans text-lg">
              The quick brown fox 0123456789
            </Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">Mono</Text>
            <Text className="font-mono text-lg">
              The quick brown fox 0123456789
            </Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">Serif</Text>
            <Text className="font-serif text-lg">
              The quick brown fox 0123456789
            </Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">Display</Text>
            <Text className="font-display text-lg">
              The quick brown fox 0123456789
            </Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">Rounded</Text>
            <Text className="font-rounded text-lg">
              The quick brown fox 0123456789
            </Text>
          </View>
        </View>
      </Section>
    </View>
  );
}

// ============================================================
// 02. RN REUSABLES
// ============================================================

function ComponentsPreview() {
  return (
    <View className="gap-8">
      {/* Buttons */}
      <Section
        title="Button"
        description="All standard variants, sizes and disabled states."
      >
        <View className="gap-3">
          <Button variant="default">
            <Text>Default</Text>
          </Button>

          <Button variant="secondary">
            <Text>Secondary</Text>
          </Button>

          <Button variant="destructive">
            <Text>Destructive</Text>
          </Button>

          <Button variant="outline">
            <Text>Outline</Text>
          </Button>

          <Button variant="ghost">
            <Text>Ghost</Text>
          </Button>

          <Button variant="link">
            <Text>Link</Text>
          </Button>
        </View>

        <Text className="font-medium">Sizes</Text>

        <View className="flex-row flex-wrap items-center gap-2">
          <Button size="sm">
            <Text>Small</Text>
          </Button>

          <Button size="default">
            <Text>Default</Text>
          </Button>

          <Button size="lg">
            <Text>Large</Text>
          </Button>
        </View>

        <Text className="font-medium">Disabled</Text>

        <View className="gap-2">
          <Button disabled>
            <Text>Disabled</Text>
          </Button>

          <Button
            variant="secondary"
            disabled
          >
            <Text>Disabled secondary</Text>
          </Button>

          <Button
            variant="outline"
            disabled
          >
            <Text>Disabled outline</Text>
          </Button>
        </View>
      </Section>

      <Divider />

      {/* Badges */}
      <Section
        title="Badge"
        description="All four built-in variants."
      >
        <View className="flex-row flex-wrap gap-2">
          <Badge variant="default">
            <Text>Default</Text>
          </Badge>

          <Badge variant="secondary">
            <Text>Secondary</Text>
          </Badge>

          <Badge variant="destructive">
            <Text>Destructive</Text>
          </Badge>

          <Badge variant="outline">
            <Text>Outline</Text>
          </Badge>
        </View>

        <Text className="font-medium">Custom accent</Text>

        <View className="flex-row">
          <Badge
            variant="secondary"
            className="bg-accent"
          >
            <Text className="text-accent-foreground">Accent badge</Text>
          </Badge>
        </View>
      </Section>

      <Divider />

      {/* Typography */}
      <Section
        title="Text"
        description="Built-in typography variants."
      >
        <View className="gap-5">
          <View className="gap-1">
            <Text variant="muted">default</Text>
            <Text variant="default">Default text</Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">h1</Text>
            <Text variant="h1">Heading 1</Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">h2</Text>
            <Text variant="h2">Heading 2</Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">h3</Text>
            <Text variant="h3">Heading 3</Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">h4</Text>
            <Text variant="h4">Heading 4</Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">p</Text>
            <Text variant="p">
              Paragraph text used for longer descriptions and regular content.
            </Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">lead</Text>
            <Text variant="lead">Leading paragraph text</Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">large</Text>
            <Text variant="large">Large text</Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">small</Text>
            <Text variant="small">Small text</Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">muted</Text>
            <Text variant="muted">Muted text</Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">block-quote</Text>
            <Text variant="blockquote">Design is how it works.</Text>
          </View>

          <View className="gap-1">
            <Text variant="muted">code</Text>
            <Text variant="code">const theme = 'primary';</Text>
          </View>
        </View>
      </Section>

      <Divider />

      {/* Labels */}
      <Section
        title="Label"
        description="Default, required and disabled labels."
      >
        <View className="gap-4">
          <View className="gap-2">
            <Label nativeID="label-default">Default label</Label>
            <Input
              aria-labelledby="label-default"
              placeholder="Default input"
            />
          </View>

          <View className="gap-2">
            <Label nativeID="label-required">Required label *</Label>
            <Input
              aria-labelledby="label-required"
              placeholder="Required input"
              aria-required
            />
          </View>

          <View className="gap-2">
            <Label
              nativeID="label-disabled"
              className="opacity-50"
            >
              Disabled label
            </Label>
            <Input
              aria-labelledby="label-disabled"
              placeholder="Disabled input"
              editable={false}
              className="opacity-50"
            />
          </View>
        </View>
      </Section>

      <Divider />

      {/* Inputs */}
      <Section
        title="Input"
        description="Common input states and keyboard types."
      >
        <View className="gap-4">
          <View className="gap-2">
            <Label nativeID="input-default">Default</Label>
            <Input
              aria-labelledby="input-default"
              placeholder="Enter text"
            />
          </View>

          <View className="gap-2">
            <Label nativeID="input-value">With value</Label>
            <Input
              aria-labelledby="input-value"
              defaultValue="Example value"
            />
          </View>

          <View className="gap-2">
            <Label nativeID="input-email">Email</Label>
            <Input
              aria-labelledby="input-email"
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="gap-2">
            <Label nativeID="input-number">Amount</Label>
            <Input
              aria-labelledby="input-number"
              placeholder="0,00 zł"
              keyboardType="decimal-pad"
            />
          </View>

          <View className="gap-2">
            <Label nativeID="input-password">Password</Label>
            <Input
              aria-labelledby="input-password"
              placeholder="Enter password"
              secureTextEntry
            />
          </View>

          <View className="gap-2">
            <Label nativeID="input-invalid">Invalid</Label>
            <Input
              aria-labelledby="input-invalid"
              aria-invalid
              placeholder="Invalid input"
              className="border-destructive"
            />
            <Text className="text-destructive text-sm">
              This field contains an error.
            </Text>
          </View>

          <View className="gap-2">
            <Label nativeID="input-disabled">Disabled</Label>
            <Input
              aria-labelledby="input-disabled"
              placeholder="Disabled input"
              editable={false}
              className="opacity-50"
            />
          </View>
        </View>
      </Section>

      <Divider />

      {/* Cards */}
      <Section
        title="Card"
        description="Card structure, content and footer."
      >
        <Card>
          <CardHeader>
            <CardTitle>Account balance</CardTitle>
            <CardDescription>Your current financial overview.</CardDescription>
          </CardHeader>

          <CardContent className="gap-2">
            <Text variant="muted">Current balance</Text>

            <Text className="font-bold text-3xl">12 480,50 zł</Text>

            <Text className="font-semibold text-primary">+1 250,00 zł</Text>

            <View className="flex-row gap-2 pt-2">
              <Badge variant="secondary">
                <Text>Active</Text>
              </Badge>

              <Badge variant="outline">
                <Text>PLN</Text>
              </Badge>
            </View>
          </CardContent>

          <CardFooter className="gap-2">
            <Button className="flex-1">
              <Text>Details</Text>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simple card</CardTitle>
            <CardDescription>Example with secondary action.</CardDescription>
          </CardHeader>

          <CardContent>
            <Text>Card content using semantic theme colors.</Text>
          </CardContent>

          <CardFooter>
            <Button
              variant="outline"
              className="flex-1"
            >
              <Text>Cancel</Text>
            </Button>
          </CardFooter>
        </Card>
      </Section>

      <Divider />

      {/* Additional semantic surfaces */}
      <Section
        title="Surfaces"
        description="Semantic background combinations."
      >
        <View className="gap-3">
          <View className="gap-1 bg-muted p-4 rounded-lg">
            <Text className="font-semibold">Muted surface</Text>

            <Text className="text-muted-foreground text-sm">
              Background and muted foreground.
            </Text>
          </View>

          <View className="gap-1 bg-popover p-4 border border-border rounded-lg">
            <Text className="font-semibold text-popover-foreground">
              Popover surface
            </Text>

            <Text className="text-muted-foreground text-sm">
              Static preview of popover tokens.
            </Text>
          </View>

          <View className="gap-1 bg-accent p-4 rounded-lg">
            <Text className="font-semibold text-accent-foreground">
              Accent surface
            </Text>

            <Text className="text-sm text-accent-foreground">
              Accent background and foreground.
            </Text>
          </View>

          <View className="gap-1 bg-primary p-4 rounded-lg">
            <Text className="font-semibold text-primary-foreground">
              Primary surface
            </Text>

            <Text className="text-primary-foreground text-sm">
              Primary background and foreground.
            </Text>
          </View>

          <View className="gap-1 bg-destructive p-4 rounded-lg">
            <Text className="font-semibold text-destructive-foreground">
              Destructive surface
            </Text>

            <Text className="text-destructive-foreground text-sm">
              Destructive background and foreground.
            </Text>
          </View>
        </View>
      </Section>
    </View>
  );
}

// ============================================================
// MAIN
// ============================================================

export function DesignSystem() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 p-4 pb-16"
    >
      <View className="gap-2">
        <Text variant="h1">Design System</Text>

        <Text variant="muted">
          NativeWind tokens and RN Reusables components.
        </Text>
      </View>

      {/* 01. Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>01. Design Tokens</CardTitle>

          <CardDescription>
            Colors, charts, spacing, borders and typography.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <DesignTokens />
        </CardContent>
      </Card>

      {/* 02. Components */}
      <Card>
        <CardHeader>
          <CardTitle>02. RN Reusables</CardTitle>

          <CardDescription>
            Components, variants, sizes and states.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ComponentsPreview />
        </CardContent>
      </Card>
    </ScrollView>
  );
}
