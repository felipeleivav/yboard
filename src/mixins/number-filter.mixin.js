var NumberFilterMixin = {
  methods: {
    numberFilter(event) {
      const code = event.which ? event.which : event.keyCode;
      const filter = code > 31 && (code < 48 || code > 57);
      return filter ? event.preventDefault() : true;
    },
  }
}

export default NumberFilterMixin;