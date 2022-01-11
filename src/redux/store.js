import { createStore, applyMiddleware } from 'redux';
// import { createStore } from 'redux';
import logger from 'redux-logger';
import rootReducer from './root-reducer';

const middlewares = [logger];

// const store = createStore(rootReducer, applyMiddleware(...middlewares));
const store = createStore(rootReducer);

export default store;