import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator } from 'react-native';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 0,
    login: '',
    refreshing: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    await this.setState({ login: user.login });

    this.loadPage();
  }

  refreshList = async () => {
    this.setState({ refreshing: true });

    await this.loadPage(1, true);

    this.setState({ refreshing: false });
  };

  loadPage = async (pageNumber = 1, shouldRefresh = false) => {
    const { stars, login } = this.state;

    this.setState({ loading: true });

    const response = await api.get(
      `/users/${login}/starred?page=${pageNumber}`
    );

    this.setState({
      stars: shouldRefresh ? response.data : [...stars, ...response.data],
      loading: false,
      page: pageNumber,
    });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, page, refreshing } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header loading={loading}>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        <Stars
          data={stars}
          keyExtractor={star => String(star.id)}
          renderItem={({ item }) => (
            <Starred>
              <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.owner.login}</Author>
              </Info>
            </Starred>
          )}
          onEndReachedThreshold={0.2}
          onEndReached={() => this.loadPage(page + 1)}
          onRefresh={this.refreshList}
          refreshing={refreshing}
          ListFooterComponent={
            loading && <ActivityIndicator size={28} color="#7159c1" />
          }
        />
      </Container>
    );
  }
}
