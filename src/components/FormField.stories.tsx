import type { Meta, StoryObj } from '@storybook/react-vite';

import { FormField, FormFieldDescription, FormFieldError, FormFieldLabel } from './FormField';
import { Input } from './Input';
import { Button } from './Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';

const meta = {
  title: 'Components/FormField',
  component: FormField,
  parameters: {
    docs: {
      description: {
        component:
          'The accessibility component — Input/Textarea are just styled controls. FormField ' +
          'wires label, description, and error to the control by id (React context + `useId`, ' +
          'never cloned children or consumer-supplied ids). `invalid` is derived from whether a ' +
          '`FormFieldError` is present, not a separate prop — rendering the error IS setting ' +
          'invalid.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <FormField className="max-w-sm">
      <FormFieldLabel>Study name</FormFieldLabel>
      <Input placeholder="Phase 3 — oncology" />
    </FormField>
  ),
};

export const WithDescription: Story = {
  name: 'With description',
  render: () => (
    <FormField className="max-w-sm">
      <FormFieldLabel>Monitor email</FormFieldLabel>
      <FormFieldDescription>Must be the site's corporate domain.</FormFieldDescription>
      <Input placeholder="name@site.org" />
    </FormField>
  ),
};

export const WithError: Story = {
  name: 'With error',
  render: () => (
    <FormField className="max-w-sm">
      <FormFieldLabel>Monitor email</FormFieldLabel>
      <FormFieldDescription>Must be the site's corporate domain.</FormFieldDescription>
      <Input defaultValue="clara@" />
      <FormFieldError>Missing the domain after the @.</FormFieldError>
    </FormField>
  ),
};

export const Required: Story = {
  render: () => (
    <FormField required className="max-w-sm">
      <FormFieldLabel>Protocol code</FormFieldLabel>
      <Input placeholder="EMB-0000" />
    </FormField>
  ),
};

export const SrOnlyLabel: Story = {
  name: 'Visually-hidden label',
  render: () => (
    <FormField className="max-w-sm">
      <FormFieldLabel srOnly>Search subjects</FormFieldLabel>
      <Input placeholder="Search subjects" />
    </FormField>
  ),
};

export const Dark: Story = {
  ...Default,
  globals: { theme: 'dark' },
};

/**
 * The realistic story: three fields (one required, one with an error, one disabled) inside a
 * real Card — this is what catches spacing that only works for a single, isolated field.
 */
function ComposedForm() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Register site</CardTitle>
        <CardDescription>Three fields, one with an error, one disabled.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField required>
          <FormFieldLabel>Site name</FormFieldLabel>
          <Input placeholder="Hospital Clínic de Barcelona" />
        </FormField>
        <FormField>
          <FormFieldLabel>Protocol code</FormFieldLabel>
          <FormFieldDescription>Three letters, hyphen, four digits.</FormFieldDescription>
          <Input defaultValue="EMB-0" />
          <FormFieldError>Missing three digits.</FormFieldError>
        </FormField>
        <FormField>
          <FormFieldLabel>Principal investigator</FormFieldLabel>
          <Input defaultValue="Assigned once the site is approved" disabled />
        </FormField>
      </CardContent>
      <CardFooter>
        <Button variant="solid">Save</Button>
        <Button variant="ghost">Cancel</Button>
      </CardFooter>
    </Card>
  );
}

export const Composed: Story = {
  render: () => <ComposedForm />,
};

export const ComposedDark: Story = {
  name: 'Composed (dark)',
  render: () => <ComposedForm />,
  globals: { theme: 'dark' },
};
