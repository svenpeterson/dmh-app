import React, { Fragment } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import AppContainer from 'components/AppContainer';
import AppBar from 'components/AppBar';
import ContentContainer from 'components/ContentContainer';
import { CircularProgress } from '@material-ui/core';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.getSites = this.getSites.bind(this);
    this.getSitesOnEnter = this.getSitesOnEnter.bind(this);
    this.showUrl = this.showUrl.bind(this);
    this.setToken = this.setToken.bind(this);
  }

  state = {};

  getUrl(site) {
    return `https://${site.value}/user/tokenlogin?token=${this.state.token}`;
  }

  showUrl(site) {
    const url = this.getUrl(site);
    return (
      <p key={site.key}>
        <a key={site.key} href={url}>
          {site.key}
        </a>
      </p>
    );
  }

  getSites() {
    this.setState({ loading: true });
    const request = async () => {
      const response = await fetch(
        `https://crxextapi.qa.wzplatform.com/identities-api/v1/user/siteNames/byAiwareToken?api_key=${
          this.state.token
        }`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }
      );
      return await response.json();
    };

    request().then(
      res => this.setState({ sites: res.list, loading: false, failed: false }),
      _ => this.setState({ sites: [], loading: false, failed: true })
    );
  }

  setToken(e) {
    this.setState({ token: e.target.value });
  }

  getSitesOnEnter(e) {
    if (e.key === 'Enter' && !!this.state.token) {
      this.getSites();
    }
  }

  render() {
    if ((this.state.sites || []).length === 1) {
      window.location.replace(this.getUrl(this.state.sites[0]));
    }

    return (
      <Fragment>
        <AppBar />
        <AppContainer appBarOffset>
          <ContentContainer>
            <TextField
              style={{ marginTop: '12px', width: '340px' }}
              label="aiWARE Session ID"
              onChange={this.setToken}
              onKeyPress={this.getSitesOnEnter}
            />
            <Button
              style={{ marginLeft: '12px' }}
              color="primary"
              variant="raised"
              onClick={this.getSites}
              disabled={!this.state.token || this.state.loading}
            >
              Get My Sites
            </Button>
            <br />
            {this.state.loading && <CircularProgress />}
            {!this.state.loading &&
              this.state.sites &&
              this.state.sites.length > 1 &&
              this.state.sites.map(site => this.showUrl(site))}
            {!this.state.loading &&
              this.state.failed && <p>Could not retrieve sites</p>}
          </ContentContainer>
        </AppContainer>
      </Fragment>
    );
  }
}
