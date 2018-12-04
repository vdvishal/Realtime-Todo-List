import { Pipe, PipeTransform } from '@angular/core';

import { SearchComponent} from './../search/search.component'

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (searchText == null) return items;
    searchText = searchText.toLowerCase();
    return items.filter(function (f) {
      return f.firstName.toLowerCase().includes(searchText);
    });
  }
}