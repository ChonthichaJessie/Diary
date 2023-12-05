import React from 'react';
import {Searchbar} from 'react-native-paper';

const SearchTab = () => {
  const [search, setSearch] = React.useState('');
  const onChangeSearch = (query: string) => setSearch(query);

  return (
    <Searchbar
      placeholder="Search"
      onChangeText={onChangeSearch}
      value={search}/>
  );
};
export default SearchTab;
