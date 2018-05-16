# Redis Workflow
Dynamic rules engine to allow configurable workflow in app without requiring code changes. 
Using Redis as backing service, you can design workflows and whenever you `run(channel)` your workflow, 
it will load your stored workflow(s) then attach a `pubsub` listener to Redis. Any time your 
`pubsub` channel message appears, it will parse the event object, perform conditional logic, and if true 
emit one or more defined actions.

This app is loosely-based on popular enterprise systems workflow rules or business process features.
 * Trigger (or event) - something happened
 * Conditions (or filters) - criteria to take action
 * Actions (or tasks) - what to do

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
```javascript
const redis = require("redis");
const flow = require("redis-workflow");

// instantiate
const config = flow.RedisConfig("localhost", 6379, null, null);
const client = redis.createClient(); // optionally pass into manager 2nd param to share
const manager = new flow.RedisWorkflowManager(config);

// create first workflow
const trigger = new flow.Trigger("myTrigger");
const rule = new flow.Rule("myRule", "foo == bar");
const action = new flow.Action("myAction", flow.ActionType.Immediate);
const workflow = new flow.Workflow("myWorkflow", trigger, [rule], [action]);

// add workflow to manager
manager.setWorkflows([workflow]);

// add listener for action
manager.on("myAction", (context) => {
    // perform something here
    console.log({context}); // should see after pubsub event below
});

// start workflow engine
manager.run("myChannel");

// publish a test object to the pubsub channel
setTimeout(() => {
    const event = {event: "myTrigger", context: {foo: "bar"}};
    client.publish("myChannel", JSON.stringify(event), (err, reply) => {
        console.log({err, reply});
    });
}, 2500);

// note, if you publish an event and conditions do not == true, no action taken
```

## Typescript
TODO

## Triggers
Uses Redis `pubsub` listening for events to start workflow.

```typescript
const trigger: ITrigger = new Trigger("test");
```

### Payload
The `message` published to the topic will include a stringified JSON object as follows.

```javascript
{
    "event": "test", // must equal Trigger name
    "context": {"myField": "myValue", "anotherField": "anotherValue"}
}
```

## Conditions
Uses `mozjexl` Javascript expression language to evaluate string expressions, evaluating to `true` or `false`.

```typescript
const rule: IRule = new Rule("Field must be valid", "myField == myValue");
```

## Actions
You define actions when building workflows. The action name will become an `EventEmitter` event you handle.

```typescript
manager.on("eventName", () => {
    // handle action here
});
```

For each `Action` you add to your workflow, you add a listener like above. You can decide what functionality 
your application performs if conditions are met, and actions are emitted.

### Suggested action types
 * Create record(s)
 * Update record(s)
 * Trigger another workflow
 * Send message(s) or notification(s)

# Contributing
I haven't thought that far ahead yet. I needed this for my project and wanted to give back. ;-)

# License
MIT (if you enhance it, fork and PR so the community benefits)