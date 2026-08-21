import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'A static container — no `onClick`, no hover affordance, no focus ring. Compound ' +
          'component: compose `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/' +
          '`CardFooter` as needed. A card that should act like a control gets its interactivity ' +
          'from a `Button` placed inside it, not from Card itself.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

function FullCard() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>A one-line description of what this card represents.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-ink">Body content goes here, composed by the consumer.</p>
      </CardContent>
      <CardFooter>
        <Button variant="solid">Confirm</Button>
        <Button variant="ghost">Cancel</Button>
      </CardFooter>
    </Card>
  );
}

export const Default: Story = {
  render: () => <FullCard />,
};

export const ContentOnly: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardContent className="pt-5">
        <p className="text-sm text-ink">A card with no header or footer, just content.</p>
      </CardContent>
    </Card>
  ),
};

export const Dark: Story = {
  render: () => <FullCard />,
  globals: { theme: 'dark' },
};
