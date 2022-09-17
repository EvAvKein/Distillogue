const validationSettings = {
  abortEarly: false, 
  stripUnknown: { // setting this to just "true" by default does the same thing as this object, but i prefer being explicit here (and prevent potential updates from modifying this)
    objects: true, 
    arrays: false // when this is set to true, joi (as of v17.5.0) deletes perfectly compliant objects from arrays for seemingly no reason. same exact object in array passed validation when hard-coded but failed when passed as request.body (i tried to debug this and ran multiple varied tests, where request.body ended up constantly failing validation and an identical hard-coded value didn't)
  },
};

export {validationSettings};