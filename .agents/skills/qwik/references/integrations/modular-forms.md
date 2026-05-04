# Integration: Modular Forms

> Source: `packages/docs/src/routes/docs/integrations/modular-forms/index.mdx`

## Installation

```bash
pnpm add -D @modular-forms/qwik   # devDependency — SSR/build-time only
```

## Workflow

### 1. Define the form type (optionally from a Valibot/Zod schema)

```ts
import * as v from 'valibot';

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.nonEmpty(), v.email()),
  password: v.pipe(v.string(), v.nonEmpty(), v.minLength(8)),
});
type LoginForm = v.InferInput<typeof LoginSchema>;
```

### 2. Create initial values via `routeLoader$`

```ts
export const useFormLoader = routeLoader$<InitialValues<LoginForm>>(() => ({
  email: '',
  password: '',
}));
```

### 3. Create the form with `useForm`

```tsx
const [loginForm, { Form, Field }] = useForm<LoginForm>({
  loader: useFormLoader(),
  validate: valiForm$(LoginSchema),  // valiForm$ / zodForm$
  action: useFormAction(),           // optional server action
});
```

### 4. Add fields

```tsx
<Form>
  <Field name="email">
    {(field, props) => (
      <div>
        <input {...props} type="email" value={field.value} />
        {field.error && <div>{field.error}</div>}
      </div>
    )}
  </Field>
  <button type="submit">Login</button>
</Form>
```

### 5. Handle submission

```ts
// Server action
export const useFormAction = formAction$<LoginForm>((values) => {
  // runs on server
}, valiForm$(LoginSchema));

// Client handler
const handleSubmit = $<SubmitHandler<LoginForm>>((values) => {
  console.log(values);
});
// Pass to <Form onSubmit$={handleSubmit}>
```

## Updating form from props

```tsx
useTask$(({ track }) => {
  const login = track(() => props.login);
  if (!login) return;
  for (const [key, value] of Object.entries(login)) {
    setValue(loginForm, key, value);
  }
});
```

## Key points

- Install as **devDependency** to avoid Vite plugin errors.
- `Field` is headless — you control all styling.
- `valiForm$` adapts Valibot; `zodForm$` adapts Zod.
- Supports arrays / objects via `FieldArray`.
- Full API and guides: [modularforms.dev](https://modularforms.dev/).
