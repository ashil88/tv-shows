/// <reference path="jquery.d.ts" />

const URL_TV_GENRES = 'https://api.themoviedb.org/3/genre/tv/list';
const URL_TV_SHOWS = 'https://api.themoviedb.org/3/discover/tv';

class TVShows {

    readonly apiGenresParameters: object;
    readonly apiShowsParameters: object;
    private genresWrapper: JQuery;
    private resultsWrapper: JQuery;
    readonly loadingDiv: HTMLDivElement;
    private errorHTML: string;

    constructor(tvShowsWrapper: JQuery) {
        this.apiGenresParameters = {'api_key': '5b6acf84a03c3efafc9d4bee9c3ab035', 'language': 'en-US'};
        this.apiShowsParameters = {'api_key': '5b6acf84a03c3efafc9d4bee9c3ab035', 'language': 'en-US', 'page': 1, 'sort_by': 'popularity.desc', 'first_air_date.gte': '2010-01-01'};
        this.genresWrapper = tvShowsWrapper.find('.genres-wrapper');
        this.resultsWrapper = tvShowsWrapper.find('.shows-wrapper');
        this.loadingDiv = document.createElement('div');
        this.loadingDiv.className = 'loader';
        this.errorHTML = `<p class="text-danger h3">Oops! Looks like there's been an error. Please try again later.</p>`;

        // on load, make request for genres
        this.callTvResource(URL_TV_GENRES, this.apiGenresParameters, this.genresResourceSuccess);

        // on filter(genre) change
        tvShowsWrapper.on('change', '.form-check-input', (e) => {
            e.preventDefault();
            this.onFilterChange($(e.currentTarget));
        })

        tvShowsWrapper.on('click', '.more-info', (e) => {
            e.preventDefault();
            alert('Link to details page: ' + $(e.currentTarget).attr('href'));
        })
    }

    private callTvResource(url: string, params: object, successCallback: any, beforeCallback?: any) {
        // ajax call to movie database api
        $.ajax({
            url: url,
            timeout: 2000,
            dataType: 'json',
            type: 'GET',
            data: params,
            context: this,
            beforeSend: beforeCallback,
            success: successCallback,
            error: this.tvResourceError
        });
    }

    // generate markup for genres list
    private genresResourceSuccess(data) {
        let {genres: tvGenres} = data,
            genresMarkup = ``;

        tvGenres.forEach((genre) => {
            genresMarkup += `<div class="form-check">
    <input class="form-check-input" type="radio" name="genres" id="${genre.name.replace(' ', '-').toLowerCase()}" value="${genre.id}">
    <label class="form-check-label" for="${genre.name.replace(' ', '-').toLowerCase()}">${genre.name}</label>
</div>`;
        });

        setTimeout(() => {
            this.genresWrapper.find('.loader').remove();
            this.genresWrapper.find('.genres-list').append(genresMarkup);
        }, 2000);
    }

    // on filter change, make new API call
    private onFilterChange(currentInput: JQuery) {
        this.apiShowsParameters['with_genres'] = currentInput.val();

        // ajax call for selected genre
        this.callTvResource(URL_TV_SHOWS, this.apiShowsParameters, this.showsResourceSuccess, this.resetResultsWrapper);
    }

    // before shows ajax call, reset display area
    private resetResultsWrapper() {
        this.resultsWrapper.empty().append(this.loadingDiv);
    }

    // generate markup for show pods
    private showsResourceSuccess(data) {
        let {results: shows} = data,
            showsMarkup = ``;

        shows.forEach((show) => {
            let imagePath = show.backdrop_path ? `https://image.tmdb.org/t/p/w300${show.backdrop_path}` : `https://placehold.it/300x169`;

            showsMarkup += `<div class="col-md-4">
    <div class="card">
        <div class="card-header">${show.name}</div>
        <img class="card-img-top" src="${imagePath}" alt="Image of ${show.name}">
        <div class="card-body">
            <p class="card-text small">${show.overview.substring(0, 99) + '...'}</p>
            <a href="/show/${show.id}" class="btn btn-outline-warning btn-sm more-info">More info</a>
        </div>
    </div>
</div>`;
        });

        this.resultsWrapper.append(showsMarkup);

        setTimeout(() => {
            this.resultsWrapper.find('.loader').remove();

            $('.card').each((i, elem) => {
                $(elem).delay(100 * i).fadeIn('fast');
            })
        }, 1000);
    }

    private tvResourceError(data, textStatus) {
        setTimeout(() => {
            this.resultsWrapper.find('.loader').remove();
            this.resultsWrapper.append(this.errorHTML);
        }, 1000);
    }
}

const tvShowsWrapper: JQuery = $('.tvshows-wrapper');
new TVShows(tvShowsWrapper);