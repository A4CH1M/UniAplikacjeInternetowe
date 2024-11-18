<?php
    /** @var $film ?\App\Model\Film */
?>

<div class="form-group">
    <label for="name">Title</label>
    <input type="text" id="name" name="post[name]" value="<?= $film ? $film->getName() : '' ?>">
</div>

<div class="form-group">
    <label for="description">Description</label>
    <textarea id="description" name="post[description]"><?= $film? $film->getDescription() : '' ?></textarea>
</div>

<div class="form-group">
    <label></label>
    <input type="submit" value="Submit">
</div>
