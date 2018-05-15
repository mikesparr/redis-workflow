# Redis Workflow
Dynamic rules engine to allow configurable workflow in app without requiring code changes.

This app is loosely-based on popular enterprise systems workflow rules or business process features.
 * Trigger (or event) - something happened
 * Conditions (or filters) - criteria to take action
 * Actions (or tasks) - what to do

## Triggers
Uses Redis `pubsub` listening for events to start workflow.

### Payload (still designing this)
The message published to the topic will include a JSON string.

```javascript
{
    "event": "test",
    "context": {"myField": "myValue", "anotherField": "anotherValue"}
}
```

## Conditions
Uses `mozjexl` Javascript expression language to evaluate string expressions, evaluating to `true` or `false`.

## Actions
Uses `composer` to chain multiple tasks and execute. I'm still undecided and testing this before publishing module.

### Suggested action types
 * Create record(s)
 * Update record(s)
 * Trigger another workflow
 * Send message(s) or notification(s)

# Installation
```bash
npm install redis-workflow
yarn add redis-workflow
```

# Test
The test script in `package.json` preprocesses the `.ts` file and then executes.

`npm test` (also can run `npm run coverage`)

# Usage
The source was written in Typescript, yet it compiles to Javascript (`npm run build`). You can use in ES5 or later supported environments. The following code snippets are implemented in the `__tests__` folder.

## Quick start (Node)
TODO

## Typescript
TODO

# Contributing
I haven't thought that far ahead yet. I needed this for my project and wanted to give back. ;-)

# License
MIT (if you enhance it, fork and PR so the community benefits)