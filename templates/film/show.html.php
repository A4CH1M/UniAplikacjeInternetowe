<?php

/** @var \App\Model\Film $film */
/** @var \App\Service\Router $router */

$title = "{$film->getName()} ({$film->getId()})";
$bodyClass = 'show';

ob_start(); ?>
    <h1><?= $film->getName() ?></h1>
    <article>
        <?= $film->getDescription();?>
    </article>

    <ul class="action-list">
        <li> <a href="<?= $router->generatePath('film-index') ?>">Back to list</a></li>
        <li><a href="<?= $router->generatePath('film-edit', ['id'=> $film->getId()]) ?>">Edit</a></li>
    </ul>
<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';
