<?php
namespace App\Controller;

use App\Exception\NotFoundException;
use App\Model\Film;
use App\Service\Router;
use App\Service\Templating;

class FilmController
{
    public function indexAction(Templating $templating, Router $router): ?string
    {
        $films = Film::findAll();
        $html = $templating->render('film/index.html.php', [
            'films' => $films,
            'router' => $router,
        ]);
        return $html;
    }

    public function createAction(?array $requestFilm, Templating $templating, Router $router): ?string
    {
        if ($requestFilm) {
            $film = Film::fromArray($requestFilm);
            // @todo missing validation
            $film->save();

            $path = $router->generatePath('film-index');
            $router->redirect($path);
            return null;
        } else {
            $film = new Film();
        }

        $html = $templating->render('film/create.html.php', [
            'film' => $film,
            'router' => $router,
        ]);
        return $html;
    }

    public function editAction(int $filmId, ?array $requestFilm, Templating $templating, Router $router): ?string
    {
        $film = Film::find($filmId);
        if (! $film) {
            throw new NotFoundException("Missing film with id $filmId");
        }

        if ($requestFilm) {
            $film->fill($requestFilm);
            // @todo missing validation
            $film->save();

            $path = $router->generatePath('film-index');
            $router->redirect($path);
            return null;
        }

        $html = $templating->render('film/edit.html.php', [
            'film' => $film,
            'router' => $router,
        ]);
        return $html;
    }

    public function showAction(int $filmId, Templating $templating, Router $router): ?string
    {
        $film = Film::find($filmId);
        if (! $film) {
            throw new NotFoundException("Missing film with id $filmId");
        }

        $html = $templating->render('film/show.html.php', [
            'film' => $film,
            'router' => $router,
        ]);
        return $html;
    }

    public function deleteAction(int $filmId, Router $router): ?string
    {
        $film = Film::find($filmId);
        if (! $film) {
            throw new NotFoundException("Missing film with id $filmId");
        }

        $film->delete();
        $path = $router->generatePath('film-index');
        $router->redirect($path);
        return null;
    }
}
