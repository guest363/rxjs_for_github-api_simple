// операторы создания Observable
import { fromEvent, EMPTY } from 'rxjs';
// только операторы из rxjs/operators могут использоваться в pipe, так как они возвращают Observable
import { map, debounceTime, distinctUntilChanged, switchMap, mergeMap, tap, catchError, filter } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import './index.less';
const URL = 'https://api.github.com/search/users?q=';

const search = document.getElementById('searche');
const result = document.getElementById('result');

const steam = fromEvent(search, 'input') //Подписаться на событие в DOM
    .pipe( // для композиции операторов 
        map(e => e.target.value), // как обычный map
        debounceTime(1000), // обычный дебаунс в 1 секунду
        distinctUntilChanged(), // если значение которое сюда пришло такое же как в прошлый раз то ничего не делать
        tap(() => result.innerHTML = ''), // для выполнения какого-либо действия при генерации объектом Observable нового значения 
        filter(value => value.trim()), // убрать лишнии пробелы и если стока не пустая выполнять дальнейший пайп
        switchMap(value =>
            /* switchMap применяет к каждому значению исходного объекта Observable функцию, 
            которая возвращает новый объект, но выполнен будет только самый последний из них 
            Т.е. вместо одного обьекта с большим количеством items от github мы бьем на отдельный 
            и дальнейшие действия выполняются для каждого отдельно*/
            ajax.getJSON(`${URL}${value}`).pipe( //похож на axios
                catchError(err => EMPTY) // при пустой строке не генерировать ошибку ajax
            )),
        map(respons => respons.items),
        mergeMap(items => items)); // выполняет функцию над каждым эл. и сливает в один Observable результат

steam.subscribe(user => {
    const html = `
        <div class="git--view--card">
            <img class="git--view--card--avatar" src="${user.avatar_url}"/>
            <span class="git--view--card--name">${user.login}</span>
            <span class="git--view--card--action">Перейти на GitHub</span>
            <a class="git--view--card--link" href="${user.html_url}" target="_blank" rel="noopener noreferrer"> </a>
            
        </div>`;
    /* insertAdjacentHTML() разбирает указанный текст как HTML или XML и 
    вставляет полученные узлы (nodes) в DOM дерево в указанную позицию. 
    Данная функция не переписывает имеющиеся элементы, что предовращает 
    дополнительную сериализацию и поэтому работает быстрее, чем манипуляции с innerHTML. */
    result.insertAdjacentHTML('beforeend', html)
})