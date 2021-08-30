let cdss = {
    state: {
        parameters: [],
    },
    mutations: {
        ['cdss/decision/parameters'](state, value) {
            if (Array.isArray(value)) {
                state.parameters = [].concat(value);
            } else {
                state.parameters = [].concat([value,]);
            }
        }
    },
    actions: {
    }
}

export default cdss;