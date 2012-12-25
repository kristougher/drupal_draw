<?php
/**
 * Menu callback for configuration page for Draw.
 */
function draw_admin_form($form, &$form_state) {
  $admin_form = array();
  $draw_settings = variable_get('draw_settings', array());

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
  return $draw_admin_form;
}