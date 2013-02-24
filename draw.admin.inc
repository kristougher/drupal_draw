<?php
/**
 * Menu callback for configuration page for Draw.
 */
function draw_admin_form($form, &$form_state) {
  $admin_form = array();
  $draw_settings = variable_get('draw_settings', array('canvas_width' => 400, 'canvas_height' => 640, 'backgrounds' => array()));

  $admin_form['basic'] = array(
    '#type' => 'fieldset',
    '#title' => t('Draw basic settings'),
  );
  $admin_form['basic']['canvas_width'] = array(
    '#title' => t('Canvas width'),
    '#type' => 'textfield',
    '#size' => 5,
    '#default_value' => $draw_settings['canvas_width'],
  );
  $admin_form['basic']['canvas_height'] = array(
    '#title' => t('Canvas height'),
    '#type' => 'textfield',
    '#size' => 5,
    '#default_value' => $draw_settings['canvas_height'],
  );
  $image_path = drupal_get_path('module', 'draw') . '/images';
  $path = drupal_get_path('module', 'draw') . '/js/';
  drupal_add_js($path . 'raphael-min.js');
  drupal_add_js($path . 'draw_fe_render.js');
  drupal_add_js($path . 'draw_basic.js');

  

  foreach ($draw_settings['backgrounds'] as $id => $background) {
    $admin_form['backgrounds'][$id] = array(
      '#type' => 'item',
      '#title' => $background['title'],
      '#markup' => '<h3><a href="/admin/config/content/drupal_draw/edit_background/' . $id . '">' . t('Edit') . '</a></h3>'
                 . '<div class="draw-canvas" id="draw-diagram-' . $id .'" data-nid="' . $id .'" data-image_path="' . $image_path . '"></div>',
    );
    drupal_add_js(array('draw' => array('drawing-' . $id => $background['content'])), 'setting');
  }

  $admin_form['background_new'] = array(
    '#type' => 'item',
    '#markup' => '<h3><a href="/admin/config/content/drupal_draw/edit_background/new_background">' . t('Create new background') . '</a></h3>',
  );

  $admin_form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save settings'),
  );  

  return $admin_form;
}

function draw_admin_form_submit($form, &$form_state) {
  $draw_settings = variable_get('draw_settings', array('canvas_width' => 400, 'canvas_height' => 640, 'backgrounds' => array()));
  $draw_settings['canvas_width'] = $form_state['values']['canvas_width'];
  $draw_settings['canvas_height'] = $form_state['values']['canvas_height'];

  variable_set('draw_settings', $draw_settings);
}

function draw_background_form($form, &$form_state) {
  $draw_settings = variable_get('draw_settings', array('backgrounds' => array()));
  $image_path = drupal_get_path('module', 'draw') . '/images';
  $create_image_uri = 'public://drupal_draw/';
  $path = drupal_get_path('module', 'draw') . '/js/';
  drupal_add_js($path . 'raphael-min.js');
  drupal_add_js($path . 'editor_base.js');
  drupal_add_js($path . 'draw_basic.js');


  $id = '';
  $content = '';
  $machine_name = '';

  if (arg(5) != 'new_background') {
    $id = arg(5);
    $content = $draw_settings['backgrounds'][$id]['content'];
    $title = $draw_settings['backgrounds'][$id]['title'];
  }

  $form['background_title'] = array(
    '#type' => 'textfield',
    '#title' => t('Background title'),
    '#default_value' => $title,
  );

  $form['existing_id'] = array(
    '#type' => 'hidden',
    '#value' =>  $id, 
  );

  $form['drawing'] = array(
    '#type' => 'textarea',
    '#default_value' => $content,
    '#title' => t('Drawing'),
    '#prefix' => '<div id="draw-diagram" data-target_element="edit-drawing" data-image_path="' . $image_path . '"></div>',
    '#attributes' => array(
      'class' => array('draw-diagram-input'),
    ),
  );

  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
  );


  return $form;
}

function draw_background_form_submit($form, &$form_state) {
  $draw_settings = variable_get('draw_settings', array('backgrounds' => array()));

  $machine_name = empty($form_state['values']['existing_id']) ?
    htmlentities(strtolower(str_replace(' ', '_', $form_state['values']['background_title']))) :
    $form_state['values']['existing_id'];

  $draw_settings['backgrounds'][$machine_name] = array(
    'content' => $form_state['values']['drawing'],
    'title' => $form_state['values']['background_title'],
  );

  $form_state['redirect'] = 'admin/config/content/drupal_draw';
  variable_set('draw_settings', $draw_settings);
}