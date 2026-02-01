/**
 * Design System Usage Example
 * This file demonstrates how to use the design system components
 * 
 * This is a reference file - you can delete it or use it as a template
 */

"use client";

import { Section, Container, Stack, HStack, Typography, Heading, Text, Muted } from "./index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DesignSystemExample() {
  return (
    <Section spacing="xl">
      <Container>
        <Stack gap={12}>
          {/* Typography Examples */}
          <Stack gap={6}>
            <Heading level={1}>Typography Examples</Heading>
            
            <Stack gap={4}>
              <Typography variant="display-lg">Display Large</Typography>
              <Typography variant="h1">Heading 1</Typography>
              <Typography variant="h2">Heading 2</Typography>
              <Typography variant="h3">Heading 3</Typography>
              
              <Text>Regular body text goes here.</Text>
              <Muted>This is muted text for secondary information.</Muted>
              
              <Typography variant="lead">
                This is a lead paragraph that stands out from regular body text.
              </Typography>
            </Stack>
          </Stack>

          {/* Layout Examples */}
          <Stack gap={6}>
            <Heading level={2}>Layout Examples</Heading>
            
            {/* Stack Example */}
            <Card>
              <CardHeader>
                <CardTitle>Stack Component</CardTitle>
              </CardHeader>
              <CardContent>
                <HStack gap={4} align="center" justify="between">
                  <Text>Left content</Text>
                  <HStack gap={2}>
                    <Button variant="outline">Cancel</Button>
                    <Button>Save</Button>
                  </HStack>
                </HStack>
              </CardContent>
            </Card>

            {/* Container Example */}
            <Card>
              <CardHeader>
                <CardTitle>Container Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <Stack gap={4}>
                  <div className="bg-muted p-4 rounded">
                    <Container size="sm" padding="md" className="bg-background rounded">
                      Small Container
                    </Container>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <Container size="md" padding="md" className="bg-background rounded">
                      Medium Container
                    </Container>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <Container size="lg" padding="md" className="bg-background rounded">
                      Large Container
                    </Container>
                  </div>
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          {/* Section Examples */}
          <Stack gap={6}>
            <Heading level={2}>Section Examples</Heading>
            
            <Section spacing="md" background="muted" containerSize="lg">
              <Stack gap={4}>
                <Heading level={3}>Muted Background Section</Heading>
                <Text>This section has a muted background and custom spacing.</Text>
              </Stack>
            </Section>

            <Section spacing="sm" background="default" containerSize="md">
              <Stack gap={4}>
                <Heading level={3}>Default Background Section</Heading>
                <Text>This section uses default background with smaller spacing.</Text>
              </Stack>
            </Section>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
