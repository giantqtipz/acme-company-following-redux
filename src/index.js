import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const APP_STARTUP_TIME = 'app_startup_time';

console.time(APP_STARTUP_TIME);

const API = 'https://acme-users-api-rev.herokuapp.com/api';

const fetchUser = async ()=> {
  const storage = window.localStorage;
  const userId = storage.getItem('userId'); 
  if(userId){
    try {
      return (await axios.get(`${API}/users/detail/${userId}`)).data;
    }
    catch(ex){
      storage.removeItem('userId');
      return fetchUser();
    }
  }
  const user = (await axios.get(`${API}/users/random`)).data;
  storage.setItem('userId', user.id);
  return  user;
};

class Header extends Component {
  render(){
    const {user, followingCompanies} = this.props;
    return (
      <>
        <h1>Acme Company Follower</h1>
        <h2 key={user.id}>You ({user.firstName} {user.lastName}) are following {followingCompanies.length} Companies</h2>
      </>
    )
  }
}

class Companies extends Component {
  state = {
    rating: 0
  }

  render(){
    const {user, companies, followingCompanies} = this.props;

    const getRating = (company) => { // find where companies and followingCompanies match, and return followingCompanies.rating
      const findCompany = followingCompanies.find((followingCompany) => followingCompany.companyId === company.id);
      if(findCompany) return findCompany.rating;
      else '';
    }

    const getFollowingCompaniesId = (company) => { // find where companies and followingCompanies match, and return followingCompanies.id
      const findCompany = followingCompanies.find((followingCompany) => followingCompany.companyId === company.id);
      if(findCompany) return findCompany.id;
    }
    
    const companiesList = companies.map((company, idx) => {
      return (
      <li className={getRating(company) ? 'selected' : ''}>
        <h3>{company.name}</h3>
        <select key={idx} value={getRating(company)} onChange={(event) => {

          this.state.rating = event.target.value;
          const putRequest = axios.put(`${API}/users/${user.id}/followingCompanies/${getFollowingCompaniesId(company)}`, {rating: this.state.rating}) // update rating via putrequest
          this.setState({ followingCompanies }); // attempt to re-render page due to changes to followingCompanies
          
        }}>
          <option key={0} value='0'>0</option>
          <option key={1} value='1'>1</option>
          <option key={2} value='2'>2</option>
          <option key={3} value='3'>3</option>
          <option key={4} value='4'>4</option>
          <option key={5} value='5'>5</option>
        </select>
      </li>
      )
    })
    
    return(
      <ul>
        {companiesList}
      </ul>
    )
  }
}

class App extends Component {
  state = {
    user: '',
    companies: [],
    followingCompanies: []
  }

  async componentDidMount(){
    const user = await fetchUser();
    const companies = axios.get(`${API}/companies`);
    const followingCompanies = axios.get(`${API}/users/${user.id}/followingCompanies`);

    Promise.all([companies, followingCompanies])
    .then((res) => {
      this.setState({
        user: user,
        companies: res[0].data,
        followingCompanies: res[1].data
      })
    });
  }

  render() {
    const {user, companies, followingCompanies} = this.state;

    return (
      <>
        <Header user={user} followingCompanies={followingCompanies}/>
        <Companies user={user} companies={companies} followingCompanies={followingCompanies}/>
      </>
    )
  }
}

ReactDOM.render(<App />, document.querySelector('#app'), () => {
  console.timeEnd(APP_STARTUP_TIME);
});


// if(getFollowingCompaniesId(company)){
//   if(getRating(company) !== 0){
//     const putRequest = axios.put(`${API}/users/${user.id}/followingCompanies/${getFollowingCompaniesId(company)}`, {rating: this.state.rating})
//     this.setState({ followingCompanies });
//   } 
//   else if(getRating(company) === 0){
//     const deleteRequest = axios.delete(`${API}/users/${user.id}/followingCompanies/${getFollowingCompaniesId(company)}`, {rating: this.state.rating, companyId: company.id})
//   }
//   this.setState({followingCompanies});
// } else {
//   console.log('not found');
//   const postRequest = axios.post(`${API}/users/${user.id}/followingCompanies`, {rating: this.state.rating, companyId: company.id})
//   this.setState({ followingCompanies });
// }
