# Redis Workflow
Dynamic rules engine to allow configurable workflow in app without requiring code changes. 
Using Redis as backing service, you can design workflows and whenever you `start` your workflow, 
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
const action = new flow.ImmediateAction("myAction");
const workflow = new flow.Workflow("myWorkflow", trigger, [rule], [action]);

// add workflow to manager
manager.setWorkflows({"myChannel": [workflow]});

// add listener for action
manager.on("myAction", (action) => {
    // perform something here
    console.log({action}); // should see after pubsub event below
});

// add error handler
manager.on("error", (error) => {
    // handle errors here
    console.error(`An error occurred: `, error);
})

// start workflow engine
manager.start("myChannel");

// publish a test object to the pubsub channel
setTimeout(() => {
    const event = {event: "myTrigger", context: {foo: "bar"}};
    client.publish("myChannel", JSON.stringify(event), (err, reply) => {
        console.log({err, reply});
    });
}, 2500);

// sometime later ...
setTimeout(() => {
    manager.stop("myChannel"); // unsubscribe from pubsub and stop emitting actions
}, 5000);

// note, if you publish an event and conditions do not == true, no action taken
```

## Typescript
See more detailed examples in the respective `src/__tests__` and `src/lib/__tests__` folders.

### Example with multiple rules and actions for a workflow
```typescript
import * as redis from "redis";
import * as flow from "redis-workflow"; // optionally import each class (see __tests__)

const config: flow.RedisConfig = new flow.RedisConfig("localhost", 6379, null, null);
const manager: flow.IWorkflowManager = new flow.RedisWorkflowManager(config);
const publisher: redis.RedisClient = new redis.createClient(); // just for our example to pubsub message

// build test workflow
const trigger: flow.ITrigger = new flow.Trigger("test.trigger101");
const rule1: flow.IRule = new flow.Rule("Foo should equal bar", `foo == "bar"`);
const rule2: flow.IRule = new flow.Rule("Should be in stock", "inStock > 0");
const action1: flow.IAction = new flow.DelayedAction("shipProduct").delay(5, "days"); // context added later when triggered
const action2: flow.IAction = new flow.ImmediateAction("adjustInventory");
const workflow: flow.IWorkflow = new flow.Workflow("test.workflow1", trigger, [rule1, rule2], [action1, action2]);

// add first workflow to manager
manager.setWorkflows({"myChannel": [workflow]});

// errors
manager.on(WorkflowEvents.Error, (error) => {
    console.error(`Something bad happened: `, error);
})

// delayed actions
manager.on(WorkflowEvents.Schedule, (action) => {
    // handle delayed actions how you like (use your own scheduler)
    console.log(`Delayed action received!`);

    switch (action.getName()) {
        case "shipProduct":
            // schedule with fulfillment
            break;
        default:
            // add to cron
            break;
    }
});

// immediate actions
manager.on(WorkflowEvents.Immediate, (action) => {
    // handle immediate actions
    console.log(`Immediate action received!`);

    switch (action.getName()) {
        case "adjustInventory":
            // task inventory management
            break;
        default:
            // global handler or notification
            break;
    }
});

// optionally handle actions by name
manager.on("adjustInventory", (action) => {
    // do something here
    const item: string = action.getContext().foo;
    const inStock: number = action.getContext().inStock;
    console.log(`Adjusting inventory for '${item}' from ${inStock} to ${inStock - 1}`);
});

// optionally handle global actions (all types)
manager.on(WorkflowEvents.Audit, (action) => {
    // publish action to stream pipeline
});

// start manager (subscribes to pubsub channel)
manager.start("babyDivision")
    .then(() => {
        // do something if you like
    });

// build and publish trigger events to Redis pubsub channel
const message: {[key: string]: any} = {
    context: {
        foo: "bar",
        inStock: 3,
    },
    event: "test.trigger101",
};

// simulate time after manager starts before triggers appear
setTimeout(() => {
    publisher.publish("babyDivision", JSON.stringify(message), (err: Error, reply: any) => {
        // simulate time later shutting down workflow channel
        setTimeout(() => {
            manager.stop("babyDivision");
        }, 3000);
    });
}, 3000);
```

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
const rule: IRule = new Rule("Field must be valid", `myField == "myValue"`);
```

## Actions
You define actions when building workflows. The action name will become an `EventEmitter` event you handle.

```typescript
// optionally named
manager.on("eventName", (action) => {
    // handle action here
});

manager.on(flow.WorkflowEvents.Schedule, (action) => {
    // handle action here
});

manager.on(flow.WorkflowEvents.Immediate, (action) => {
    // handle action here
});
```

For each `Action` you add to your workflow, you one or more listeners like above. You can decide what functionality 
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
