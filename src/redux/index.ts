import { createStore, applyMiddleware } from 'redux';
import subscribeActionMiddleware from 'redux-subscribe-action';
import { rootReducer } from './reducers';

const store = createStore(
  rootReducer,
  applyMiddleware(subscribeActionMiddleware)
);

export default store;

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch