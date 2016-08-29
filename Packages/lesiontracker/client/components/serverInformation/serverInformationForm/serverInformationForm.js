import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { DICOMWebServer as dicomSchema } from 'meteor/worklist/both/schema';
import { DIMSEServer as dimseSchema } from 'meteor/worklist/both/schema';

Template.serverInformationForm.onCreated(() => {
    const instance = Template.instance();

    instance.currentSchema = new ReactiveVar(dicomSchema);
});

Template.serverInformationForm.onRendered(() => {
    const instance = Template.instance();

    instance.data.$form = instance.$('form');
    instance.data.form = instance.data.$form.data('component');

    // Handle the server type
    instance.autorun(() => {
        // Get the server type component
        const typeComponent = instance.$('[data-key=type]').data('component');

        // Run this computation every time the user change the server type
        typeComponent.changeObserver.depend();

        // Get the current server type value
        const type = typeComponent.value();

        // Set the serverType reactive value
        instance.data.serverType.set(type);

        // Change the schema based on the selected server type
        if (type === 'dimse') {
            instance.currentSchema.set(dimseSchema);
        } else {
            instance.currentSchema.set(dicomSchema);
        }
    });

    // Handle the form mode (edit or add)
    instance.autorun(() => {
        const mode = instance.data.mode.get();

        // Check if it is on edit mode and load the saved data
        if (mode === 'edit') {
            var data = instance.data.currentItem.get();
            instance.data.form.value(data);
        }
    });
});

Template.serverInformationForm.events({
    submit(event, instance) {
        event.preventDefault();
        var formData = FormUtils.getFormData(instance.data.$form);
        Meteor.call('serverSave', formData, function(error) {
            if (error) {
                // TODO: check for errors: not-authorized, data-write
                console.log('>>>>ERROR', error);
            }

            instance.data.resetState();
        });
    }
});
