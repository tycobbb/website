// @flow
import React from 'react'
import { Switch, Route } from 'react-router-dom'
import * as scenes from '../scenes'

export const Routes = () => <Switch>
  <Route path='/' component={scenes.Home} />
</Switch>
