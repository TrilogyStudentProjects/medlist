import React, { Component } from 'react';
import { Route, withRouter, Switch} from 'react-router-dom';
import $ from "axios";
import Medlistcontainer from './components/medlistcontainer'
import Meddetail from './components/meddetail';
import Interactions from './components/interactions';
import Navbar from './components/navbar';
import MedSearch from './components/medsearch';
import Schedule from './components/schedule';
import Homelogin from './components/homelogin';
import Appfooter from './components/appfooter';
import Settings from './components/settings';
import './App.css';
import Header from './components/header'


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuth: false
    }
  }

  componentWillMount() {
      this.testAuth();
  }

  testAuth = () => {
    $.get('/api/test')
    .then(res => {
      this.setState({ 
        isAuth: true,
        email:  res.data.email,
        userId: res.data.id
      })
    })
    .catch(err => this.setState({
        isAuth: false
    }))
  }

  render() {
    return ( 
      <div className="App">
      <Header isAuth={this.state.isAuth} 
        email={this.state.email}/> 
        {this.state.isAuth && this.props.history.location.pathname !== '/' &&
        this.props.history.location.pathname !== '/settings' &&
        <Navbar />} 
        <Switch>
          <Route path = "/" 
            render={props => <Homelogin {...props} isAuth={this.state.isAuth} email={this.state.email}/>} 
            exact />
          <Route path = "/medlistcontainer" component={Medlistcontainer} exact />
          <Route path = "/meddetail/:medId/:FDAId/:brandname" component={Meddetail} exact />
          <Route path = "/interactionsview" component={Interactions} exact />
          <Route path = "/scheduleview" component={Schedule} exact />
          <Route path = "/search" component={MedSearch} exact />
          <Route path="/settings" render={props => <Settings {...props} userId={this.state.userId} isAuth={this.state.isAuth}/>} 
            exact/>
          {/* <Route path="open/:userId" component={} exact/> */}
        </Switch>
        <Appfooter/>
      </div>
    );
  }
}

export default withRouter(App);
