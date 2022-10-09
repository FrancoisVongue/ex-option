import {Option} from '../src';

describe('Option', () => {
    class User {constructor(private name: string) {}}

    const getUser = (id: string) => {
        const r = Math.random();
        
        if(r < 0.2) {
            return new Option(`success`, new User('Name'));
        } else if (r < 0.4) {
            return new Option(`not_found`, new Error('Not found'));
        } else if (r < 0.6) {
            return new Option(`db_error`, new Error('Database connection error'));
        } else {
            return new Option(`internal_error`, new Error('Internal server error'));
        }
    }

    const getUserMayThrow = (id: string) => {
        const r = Math.random();
        
        if(r < 0.5) {
            return new User('Name');
        } else {
            throw new Error('Not found');
        }
    }

    const getUserMayThrowAsync = async (id: string) => {
        const r = Math.random();
        
        if(r < 0.5) {
            return Promise.resolve(new User('Name'));
        } else {
            throw new Error('Not found');
        }
    }

    describe(`match`, () => {
        for (const _ of Array(10).fill(0)) {
            const user = getUser('231123c213');
            const type = user.type();
            it(`Sould force user to handle ${type} outcome`, () => {
                user.match({
                    db_error(value) {
                        const type = user.type();
                        expect(type).toBe('db_error');
                        expect(value).toBeInstanceOf(Error);
                    },
                    internal_error(value) {
                        const type = user.type();
                        expect(type).toBe('internal_error');
                        expect(value).toBeInstanceOf(Error);
                    },
                    not_found(value) {
                        const type = user.type();
                        expect(type).toBe('not_found');
                        expect(value).toBeInstanceOf(Error);
                    },
                    success(value) {
                        const type = user.type();
                        expect(type).toBe('success');
                        expect(value).toBeInstanceOf(User);
                    },
                })
            })
        }
    })

    describe(`imatch`, () => {
        for (const _ of Array(10).fill(0)) {
            const user = getUser('231123c213');
            const type = user.type();
            it(`Sould force user to handle ${type} outcome`, () => {
                user.imatch({
                    success(value) {
                        const type = user.type();
                        expect(type).toBe('success');
                        expect(value).toBeInstanceOf(User);
                    },
                    ['*'](value) {
                        const type = user.type();
                        expect(type).not.toBe('success');
                        expect(value).not.toBeInstanceOf(User);
                    },
                })
            })
        }
    })
    
    describe('catch', () => {
        for (const _ of Array(10).fill(0)) {
            it(`should allow to wrap methods that may throw`, () => {
                const userOptions = Option.catch('success', 'error', () => getUserMayThrow('id'));
                userOptions.match({
                    success(user) {
                        expect(user).toBeInstanceOf(User);
                    },
                    error(error) {
                        expect(error).toBeInstanceOf(Error);
                    },
                })
            })
        }
    })

    describe('asyncCatch', () => {
        for (const _ of Array(10).fill(0)) {
            it(`should allow to wrap async methods that may throw`, async () => {
                const userOptions = await Option.asyncCatch('success', 'error', () => getUserMayThrowAsync('id'));
                userOptions.match({
                    success(user) {
                        expect(user).toBeInstanceOf(User);
                    },
                    error(error) {
                        expect(error).toBeInstanceOf(Error);
                    },
                })
            })
        }
    })
})