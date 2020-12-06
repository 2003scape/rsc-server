const items = require('@2003scape/rsc-data/config/items');

// maximum stack size of an item is 2^31
const MAX_STACK_SIZE = Math.pow(2, 31);

// determines the way in which a container stacks elements
const StackPolicy = {
    // never stack identical elements
    NEVER: Symbol('StackPolicy_NEVER'),

    // always stack identical elements
    ALWAYS: Symbol('StackPolicy_ALWAYS'),

    // use a given function to stack identical elements
    USE_FUNCTION: Symbol('StackPolicy_USE_FUNCTION')
};

function defaultComparator(a, b) {
    return a === b;
}

function IDComparator(a, b) {
    return a.id === b.id;
}

function defaultStackable(element) {
    return false;
}

function definitionStackable(element) {
    return items[element.id].stackable;
}

class Container {
    constructor(
        capacity,
        stackPolicy = StackPolicy.NEVER,
        comparator = defaultComparator,
        stackable = defaultStackable
    ) {
        // pre-allocate the element slots. as of now, there isn't a use-case
        // where dynamic size allocation is necessary. the objects held in
        // this.slots depends on which stack policy is used. see below.
        this.slots = new Array(capacity);

        // the number of slots used
        this.size = 0;

        // the capacity of the container
        this.capacity = capacity;

        // the way in which the container handles identical elements
        this.stackPolicy = stackPolicy;

        // a binary function to test for equality of two objects,
        // this function should return true/false
        this.comparator = comparator;

        // stackable function to use when stackPolicy is USE_FUNCTION
        this.stackable = stackable;
    }

    clear() {
        this.slots = new Array(this.capacity);
        this.size = 0;
    }

    add(element, amount = 1) {
        if (element === null || amount < 0 || amount > MAX_STACK_SIZE) {
            return false;
        }

        switch (this.stackPolicy) {
            case StackPolicy.NEVER:
                if (this.size + amount > this.capacity) {
                    return false;
                }

                for (let i = 0; i < amount; i++) {
                    this.slots[this.size] = [element, 1];
                    this.size += 1;
                }
                return true;

            case StackPolicy.ALWAYS:
                // check if the item already is in a slot
                for (let i = 0; i < this.size; i++) {
                    const [elem, count] = this.slots[i];

                    if (this.comparator(element, elem)) {
                        const totalAmount = count + amount;

                        if (totalAmount > MAX_STACK_SIZE) {
                            // too large to hold
                            return false;
                        }

                        this.slots[i] = [element, totalAmount];
                        return true;
                    }
                }

                // its not already in a slot, check if we can just add it
                if (this.size >= this.capacity) {
                    return false;
                }

                this.slots[this.size] = [element, amount];
                this.size += 1;
                return true;
            case StackPolicy.USE_FUNCTION:
                const stackable = this.stackable(elem);

                for (let i = 0; stackable && i < this.size; i++) {
                    const [elem, count] = this.slots[i];

                    if (this.comparator(element, elem)) {
                        const totalAmount = count + amount;

                        if (totalAmount > MAX_STACK_SIZE) {
                            return false;
                        }

                        this.slots[i] = [element, totalAmount];
                        return true;
                    }
                }

                if (this.size >= this.capacity) {
                    return false;
                }

                this.slots[this.size] = [element, amount];
                this.size += 1;
                return true;
        }
    }

    remove(element, amount = 1) {
        if (element === null || amount < 0 || amount > MAX_STACK_SIZE) {
            return false;
        }

        const slots = [];
        const size = 0;

        switch (this.stackPolicy) {
            case StackPolicy.NEVER:
                if (this.size - amount < 0) {
                    return false;
                }

                for (let i = 0; i < this.size; i++) {
                    const [elem] = this.slots[i];

                    if (amount > 0 && this.comparator(element, elem)) {
                        amount -= 1;
                    } else {
                        slots.push([elem, 1]);
                        size += 1;
                    }
                }

                if (amount === 0) {
                    // we removed all elements
                    this.slots = slots;
                    this.size = size;
                    return true;
                } else {
                    // not enough elements to remove
                    return false;
                }

            case StackPolicy.ALWAYS:
            case StackPolicy.USE_FUNCTION:
                for (let i = 0; i < this.size; i++) {
                    const [elem, count] = this.slots[i];

                    if (this.comparator(element, elem)) {
                        const totalAmount = count - amount;

                        if (totalAmount < 0) {
                            // not large enough
                            return false;
                        }

                        if (totalAmount === 0) {
                            this.slots.splice(i, 1);
                            this.slots.length = this.capacity; // resize ?
                            this.size -= 1;
                        } else {
                            this.slots[i] = [element, totalAmount];
                        }
                        return true;
                    }
                }

                return false;
        }
    }

    has(element, amount = 1) {
        return this.count(element) >= amount;
    }

    count(element) {
        const elemCount = 0;

        for (let i = 0; i < this.size; i++) {
            let [elem, count] = this.slots[i];

            if (this.comparator(element, elem)) {
                elemCount += count;
            }
        }

        return elemCount;
    }

    toJSON() {
        return this.slots.filter(Boolean);
    }
}

module.exports = {
    Container,
    StackPolicy,
    defaultComparator,
    IDComparator,
    defaultStackable,
    definitionStackable
};
